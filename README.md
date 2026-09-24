# stripmap

```
npm install @transitmatters/stripmap
```

This library can be used to create strip maps using React and SVG, like this one from the [TransitMatters Data Dashboard](https://dashboard.transitmatters.org/red/slowzones):

<img width="1146" alt="image" src="https://github.com/transitmatters/stripmap/assets/2208769/5d1724a5-4349-4bea-8f46-6a038bb31b65">

## Releasing

Bump the `version` in `package.json` (e.g. `npm version patch --no-git-tag-version`) and merge to `main`. The [publish workflow](.github/workflows/publish.yml) will build, test, and publish the new version to [npm](https://www.npmjs.com/package/@transitmatters/stripmap) and GitHub Packages, then create a `vX.Y.Z` GitHub release. Pushes that don't change the version publish nothing.

Publishing to npm uses [trusted publishing](https://docs.npmjs.com/trusted-publishers), so no npm token is needed. It is configured on npmjs.com under the package's Settings → Trusted Publisher (GitHub Actions, org `transitmatters`, repo `stripmap`, workflow `publish.yml`).
