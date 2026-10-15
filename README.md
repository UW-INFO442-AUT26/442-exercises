# INFO 442 exercises

The practice exercises for INFO 442, Cooperative Software Development, on one
site: **https://uw-info442-aut26.github.io/442-exercises/**

Open the home page, pick an exercise, and finish it on a phone. Every exercise
is also reachable directly, which is what to hand out in lab:

```
https://uw-info442-aut26.github.io/442-exercises/exercises/<slug>/
```

## Layout

```
index.html         the home page. Generated, do not edit by hand
exercises.json     the list the home page is built from
scripts/           build-index.mjs, which turns the list into the home page
exercises/<slug>/  one exercise: index.html plus the spec it was built from
```

Each exercise is a single self-contained page. It loads nothing from the
network, so it works from any path and keeps working offline once it is open.

## Add an exercise

1. Build it with the class skill `442-create-exercise`. That produces
   `index.html` and `spec.json` for one topic.
2. Put the folder at `exercises/<slug>/`, where `<slug>` is `meta.slug` from the
   spec. The slug is the URL, so make it read well.
3. Add an entry to `exercises.json`: `slug`, `title`, `goal`, `minutes`, `steps`,
   `questions`, `activities`, `tags`, `date`. `questions` counts the steps
   that are scored, `activities` the ones that are not.
4. Rebuild the home page and check it:

   ```bash
   node scripts/build-index.mjs
   ```

   It refuses to build a broken entry, and it checks that every slug has a real
   `index.html` behind it.
5. Commit and push. Pages redeploys in about a minute.

## The gate

```bash
node scripts/build-index.mjs --check   # home page matches the list
```

Run it before you commit. The pages themselves are checked by the exercise
skill's validator, which lives in
[442-skills](https://github.com/UW-INFO442-AUT26/442-skills).

## License

MIT, matching the class skills repo.
