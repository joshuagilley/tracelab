# Add a New Lab Section

This guide covers adding a brand-new lab (not just a new concept).

## 1) Choose the lab id and label

Define a stable kebab-case `labId` (for URLs, Mongo ids, and filters), plus a user-facing label.

## 2) Update frontend lab registry

Edit `apps/web/src/contexts/lab.tsx`:

- add the new `LabId` union value
- add a `LAB_GROUPS` option with `id`, `label`, and `slug`

This makes the lab selectable in the app and available to pages that iterate `LAB_OPTIONS`.

## 3) Create the Mongo `Labs` document

Insert one `Labs` document with:

- `_id` = `labId`
- `panelPrefix`
- `topics` (each topic has `id`, `title`, `blurb`, `conceptSlugs`)
- optional `languages`
- optional `defaultOpenSectionIds`
- optional `all_tracks: true` when this lab should always appear for all career tracks

## 4) Add initial concepts in `Concepts`

Create one or more concept documents with:

- `_id` = `<labId>/<slug>`
- `labId` matching new lab
- `topicId` matching one `topics[].id`
- core metadata (`title`, `summary`, `difficulty`, `status`, `tags`, `vizType`)

Also include `practice`, `parameters`, `metricGroups`, and `codeFiles` where needed.

## 5) Add lesson/simulation components

- Add lesson panel components and register in `lesson-registry.ts`, or
- add simulation adapters and register in `simulation-registry`.

## 6) Track filtering considerations

- `all` mode: everything shows.
- `published` mode: only available concepts/labs with available concepts.
- `track` mode: tag-matched concepts plus labs with `all_tracks: true`.

Pick tags and `all_tracks` intentionally based on desired visibility.

## 7) Validate

- Lab appears in dropdown.
- Topic sidebar renders sections and concept links.
- Concepts load from API and routes work.
- Filters (`all`, `published`, `track`) behave as expected.
