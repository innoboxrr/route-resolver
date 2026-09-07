/**
 * Resuelve las rutas que exporta el paquete de Laravel innoboxrr/routes-to-json
 * (`php artisan route:json`), a partir de un mapa nombre -> URI.
 *
 *     import route, { setRoutes } from 'innoboxrr-route-resolver'
 *
 *     setRoutes(routes)
 *
 *     route('api.deals.deal.index')                 // posicional
 *     route('api.deals.deal.show', 7)               // posicional
 *     route('api.deals.deal.show', { id: 7 })       // nombrado
 *     route('api.deals.deal.index', { page: 2 })    // lo que sobra va al query
 */

let routes = {}

let baseUrl = null

let strict = false

export function setRoutes(newRoutes) {
    routes = newRoutes ?? {}
}

/**
 * Sin argumento se vuelve a `location.host`, que a diferencia de `hostname`
 * incluye el puerto: sin el, en local contra :8000 las URLs salian rotas.
 */
export function setBaseUrl(newUrl = undefined) {
    baseUrl = newUrl ?? null
}

/**
 * En modo estricto una ruta desconocida lanza en lugar de devolver undefined.
 * Por defecto queda desactivado para no cambiar el comportamiento de las
 * aplicaciones que ya lo toleran, pero conviene activarlo en tests.
 */
export function setStrict(value = true) {
    strict = Boolean(value)
}

export function hasRoute(name) {
    return Object.prototype.hasOwnProperty.call(routes, name)
}

function host() {
    if (baseUrl !== null) {
        return baseUrl
    }

    // Se evalua al llamar y no al importar el modulo: en SSR o en un test
    // `window` puede no existir todavia.
    return typeof window !== 'undefined' ? window.location.host : ''
}

function isParam(segment) {
    return segment.startsWith('{') && segment.endsWith('}')
}

function paramName(segment) {
    return segment.slice(1, -1).replace(/\?$/, '')
}

function isOptional(segment) {
    return segment.endsWith('?}')
}

function buildQuery(params) {
    const query = new URLSearchParams()

    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) {
            continue
        }

        if (Array.isArray(value)) {
            value.forEach((item) => query.append(`${key}[]`, item))

            continue
        }

        query.append(key, value)
    }

    return query.toString()
}

export default function route(name, ...args) {
    if (! hasRoute(name)) {
        if (strict) {
            throw new Error(`Unknown route ${name}`)
        }

        console.error(`Unknown route ${name}`)

        return undefined
    }

    // Un unico argumento objeto (que no sea array) significa modo nombrado.
    const named = args.length === 1
        && typeof args[0] === 'object'
        && args[0] !== null
        && ! Array.isArray(args[0])

    const params = named ? { ...args[0] } : null
    const positional = named ? [] : [...args]

    const segments = []

    for (const segment of routes[name].split('/')) {
        if (! isParam(segment)) {
            segments.push(segment)

            continue
        }

        const key = paramName(segment)

        let value

        if (named) {
            value = params[key]
            delete params[key]
        } else {
            value = positional.shift()
        }

        // Un parametro opcional sin valor desaparece de la URI; antes
        // consumia argumento igual y dejaba un "undefined" en la ruta.
        if (value === undefined || value === null) {
            if (isOptional(segment)) {
                continue
            }

            throw new Error(`Missing required parameter "${key}" for route ${name}`)
        }

        segments.push(encodeURIComponent(value))
    }

    const uri = `//${host()}/${segments.join('/')}`

    // Lo que no se consumio como parametro se convierte en query string.
    const query = named && Object.keys(params).length > 0 ? buildQuery(params) : ''

    return query ? `${uri}?${query}` : uri
}
