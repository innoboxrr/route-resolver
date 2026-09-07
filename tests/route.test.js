import { beforeEach, describe, expect, it, vi } from 'vitest'

import route, { hasRoute, setBaseUrl, setRoutes, setStrict } from '../index.js'

const ROUTES = {
    'api.deals.deal.index': 'api/innoboxrr/deals/deal/index',
    'api.deals.deal.show': 'api/innoboxrr/deals/deal/{id}',
    'api.deals.deal.nested': 'api/deals/{deal}/items/{item}',
    'debugbar.cache.delete': '_debugbar/cache/{key}/{tags?}',
}

beforeEach(() => {
    setRoutes(ROUTES)
    setBaseUrl()
    setStrict(false)
})

describe('route()', () => {

    it('resuelve una ruta sin parametros', () => {
        expect(route('api.deals.deal.index')).toBe('//localhost:3000/api/innoboxrr/deals/deal/index')
    })

    it('sustituye parametros posicionales', () => {
        expect(route('api.deals.deal.show', 7)).toBe('//localhost:3000/api/innoboxrr/deals/deal/7')
    })

    it('sustituye varios parametros posicionales en orden', () => {
        expect(route('api.deals.deal.nested', 3, 9)).toBe('//localhost:3000/api/deals/3/items/9')
    })

    it('acepta parametros nombrados', () => {
        expect(route('api.deals.deal.nested', { deal: 3, item: 9 }))
            .toBe('//localhost:3000/api/deals/3/items/9')
    })

    /**
     * Antes cualquier segmento {…} consumia un argumento, incluidos los
     * opcionales: `_debugbar/cache/{key}/{tags?}` exigia dos.
     */
    it('omite los parametros opcionales que no recibe', () => {
        expect(route('debugbar.cache.delete', 'abc')).toBe('//localhost:3000/_debugbar/cache/abc')
    })

    it('incluye los parametros opcionales cuando si los recibe', () => {
        expect(route('debugbar.cache.delete', 'abc', 'tag'))
            .toBe('//localhost:3000/_debugbar/cache/abc/tag')
    })

    it('convierte en query string lo que no es parametro de la ruta', () => {
        expect(route('api.deals.deal.index', { page: 2, sort: 'name' }))
            .toBe('//localhost:3000/api/innoboxrr/deals/deal/index?page=2&sort=name')
    })

    it('serializa arrays en el query string', () => {
        expect(route('api.deals.deal.index', { ids: [1, 2] }))
            .toContain('ids%5B%5D=1&ids%5B%5D=2')
    })

    it('mezcla parametros de ruta y query', () => {
        expect(route('api.deals.deal.show', { id: 7, expand: 'items' }))
            .toBe('//localhost:3000/api/innoboxrr/deals/deal/7?expand=items')
    })

    it('escapa los valores de los parametros', () => {
        expect(route('api.deals.deal.show', 'a b/c')).toBe('//localhost:3000/api/innoboxrr/deals/deal/a%20b%2Fc')
    })

    it('falla si falta un parametro obligatorio', () => {
        expect(() => route('api.deals.deal.show')).toThrow('Missing required parameter "id"')
    })

    /**
     * location.hostname no incluye el puerto, asi que en local contra :8000
     * las URLs salian sin el y no resolvian.
     */
    it('conserva el puerto del host', () => {
        expect(route('api.deals.deal.index')).toContain('localhost:3000')
    })

    it('admite un host propio', () => {
        setBaseUrl('api.ejemplo.test')

        expect(route('api.deals.deal.index')).toBe('//api.ejemplo.test/api/innoboxrr/deals/deal/index')
    })

    it('vuelve al host del navegador al limpiar el override', () => {
        setBaseUrl('api.ejemplo.test')
        setBaseUrl()

        expect(route('api.deals.deal.index')).toContain('localhost:3000')
    })

})

describe('rutas desconocidas', () => {

    it('avisa por consola y devuelve undefined por defecto', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

        expect(route('no.existe')).toBeUndefined()
        expect(spy).toHaveBeenCalledWith('Unknown route no.existe')

        spy.mockRestore()
    })

    it('lanza en modo estricto', () => {
        setStrict(true)

        expect(() => route('no.existe')).toThrow('Unknown route no.existe')
    })

})

describe('hasRoute()', () => {

    it('dice si una ruta esta registrada', () => {
        expect(hasRoute('api.deals.deal.index')).toBe(true)
        expect(hasRoute('no.existe')).toBe(false)
    })

})
