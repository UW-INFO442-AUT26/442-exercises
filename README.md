# INFO 442 exercises

The practice exercises for INFO 442, Cooperative Software Development, on one
site: **https://uw-info442-aut26.github.io/442-exercises/**

Open the home page, pick an exercise, and finish it. Every exercise is also
reachable directly, which is what to hand out in lab:

```
https://uw-info442-aut26.github.io/442-exercises/exercises/<slug>/
```

## Two kinds

| Kind | What the student does | Where the code lives |
|---|---|---|
| `quiz` | One page, answered on a phone, about ten minutes | `exercises/<slug>/index.html`, built from its `spec.json` |
| `interactive` | Clones a small React project, then fixes a few TODO comments on a laptop | `practice/<slug>/`, with a landing page at `exercises/<slug>/index.html` |

A quiz is a single self-contained page. It loads nothing from the network, so it
works from any path and keeps working offline once it is open.

An interactive problem is a running Vite project. Its landing page carries the
clone command and the goal; the project's own `README.md` carries the task.

## Layout

```
index.html         the home page. Generated, do not edit by hand
exercises.json     the list the home page is built from
scripts/           build-index.mjs, which turns the list into the home page
exercises/<slug>/  what the student opens: one page per exercise
practice/<slug>/   the React project behind an interactive problem
```

## Add an exercise

1. Build it with the class skill `442-create-exercise`. A quiz comes back as
   `index.html` and `spec.json`; an interactive problem comes back as a project
   folder.
2. Put the folder at `exercises/<slug>/`, where `<slug>` is `meta.slug` from the
   spec. The slug is the URL, so make it read well. An interactive problem's
   project goes at `practice/<slug>/`.
3. Add an entry to `exercises.json`: `number`, `kind`, `slug`, `title`, `goal`,
   `minutes`, `questions`, `activities`, `tags`, `date`, and `practice` for an
   interactive one. `number` is the order it was made in and it is unique.
   `questions` counts the steps that are scored, `activities` the ones that are
   not. An interactive problem scores nothing, so its `questions` is 0.
4. Rebuild the home page and check it:

   ```bash
   node scripts/build-index.mjs
   ```

   It refuses to build a broken entry, and it checks that every slug has a real
   page behind it and every interactive entry has a real `package.json` behind
   it.
5. Commit and push. Pages redeploys in about a minute.

## The gate

```bash
node scripts/build-index.mjs --check   # home page matches the list
```

Run it before you commit. The quiz pages themselves are checked by the exercise
skill's validator, which lives in
[442-skills](https://github.com/UW-INFO442-AUT26/442-skills).

## License

MIT, matching the class skills repo.
