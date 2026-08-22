# Route Resolver

**Laravel route names, resolved in JavaScript.**

The browser half of [routes-to-json](https://github.com/innoboxrr/routes-to-json). Reads the exported route manifest and resolves names to URLs — parameters, query strings and all.

```js
import route from 'innoboxrr-route-resolver';

route('user.profile', { id: 42 });
// → /users/42/profile

route('invoices.index', {}, { status: 'paid', page: 2 });
// → /invoices?status=paid&page=2
```

## Why

Your SPA should not know that a profile lives at `/users/:id/profile`. It should know the route is called `user.profile`. Then the backend can move it and nothing in the frontend breaks.

| | |
|---|---|
| **Named resolution** | Same names as your Laravel route definitions |
| **Parameter binding** | Required and optional segments |
| **Query strings** | Appended and encoded properly |
| **Zero dependencies** | Plain JavaScript, works with any framework |

## Install

```bash
npm install innoboxrr-route-resolver
```

Generate the manifest with `php artisan routes:json` on the Laravel side.

---

Part of [Innobox R&R](https://github.com/innoboxrr) — 52 open-source packages extracted from production work. **[innobox.systems](https://innobox.systems)**
