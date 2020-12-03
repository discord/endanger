# endanger

> Build [Dangerfiles](https://danger.systems/js/) with ease.

- Break your Danger code into "rules".
- Only run rules when a relevant file changes.
- Make adding new rules more accessible to non-JS developers.

## Setup

```sh
npm install --save-dev endanger
```

> **Note:** Endanger requires `danger@10.5.3` and above. Please update your
> `danger` dependency.

Create a file system like this:

```txt
package.json
dangerfile.ts
/danger/
  myFirstRule.ts
  mySecondRule.ts
  myThirdRule.ts
```

Then use the `run(...rules)` function from `endanger` in your dangerfile:

```js
// dangerfile.ts
import { run } from "endanger"

import myFirstRule from "./danger/myFirstRule"
import mySecondRule from "./danger/mySecondRule"
import myThirdRule from "./danger/myThirdRule"

run(
  myFirstRule(),
  mySecondRule(),
  myThirdRule({
    someOption: "foo",
  }),
  myThirdRule({
    someOption: "bar",
  }),
)
```

Now let's write your first `endanger` rule.

```ts
import { Rule } from "endanger"

export default function myFirstRule() {
  return new Rule({
    // "Glob" patterns of files you want to look at in this rule.
    files: ["scary-directory/**"],
    // A map of strings for different warnings/failures/etc so you don't have to
    // clutter your rule code.
    messages: {
      // Pro-tip: The indentation will automatically be stripped away :P
      myFirstWarning: `
        Hey you added a new file to "scary-directory/"!
      `,
    },
    // And here goes your code for the rule...
    async run(files, context) {
      // You can explore the state of the files you matched with your glob patterns.
      for (let file of files.created) {
        // Then you can report a warning/failure/etc by referencing your message
        // from the map of strings above. You can also optionally include a file
        // and even a line number.
        context.warn("myFirstWarning", file)
      }
    },
  })
}
```

This rule warns you whenever you create a new file in the `scary-directory/`.
But endanger makes it easy to write lots of other types of rules.

```ts
import { Rule } from "endanger"

export default function mySecondRule() {
  return new Rule({
    files: ["api/routes/*.py"],
    messages: {
      foundNewRouteWithoutRateLimit: `...`,
      foundRemovedRateLimit: `...`,
      foundAddedRateLimit: `...`,
    },
    // And here goes your code for the rule...
    async run(files, context) {
      // files.edited will give you a list of all files created or modified
      for (let file of files.edited) {
        // file.created will tell you if the current file was created in this diff
        if (file.created) {
          // file.contains() will tell you if the file contains a string or regex
          if (!(await file.contains("@ratelimit("))) {
            context.warn("foundNewRouteWithoutRateLimit", file)
          }
        }

        // file.modified will tell you if the current file was created in this diff
        if (file.modified) {
          // file.before() returns the state of the file before the changes (if it existed)
          let before = await file.before()?.contains("@ratelimit(")
          let after = await file.contains("@ratelimit(")

          if (before && !after) {
            context.fail("foundAddedRateLimit", file)
          } else if (!before && after) {
            context.message("foundAddedRateLimit", file)
          }
        }
      }
    },
  })
}
```

## API

### `run`

This should be in your Dangerfile, pass [`Rule`](#rule)'s run them.

<!-- prettier-ignore -->
```ts
import { run } from "endanger"

import rule1 from "./danger/rule1"
import rule2 from "./danger/rule2"
import rule3 from "./danger/rule3"

run(
  rule1,
  rule2,
  rule3,
)
```

### `Rule`

```ts
import { Rule } from "endanger"

export default function myRule() {
  return new Rule({
    files: ["path/to/**", "{glob,patterns}"],
    messages: {
      myFirstWarning: `...`,
      mySecondWarning: `...`,
    },
    async run(files, context) {
      // ...
    },
  })
}
```

> **Note:** It's recommended you wrap your rules with a function so you could
> add options to them later. For example, you could run the same rule twice on
> different directories provided as options.

### `Context`

```ts
context.warn("myMessage", location?, values?)
context.fail("myMessage", location?, values?)
context.message("myMessage", location?, values?)

// examples:
context.warn("myMessage")
context.warn("myMessage", { file })
context.warn("myMessage", { file, line })
context.warn("myMessage", { file, line }, { ...values })
```

Note: Your Rule's `messages` can have also have special `{values}` in them:

```ts
new Rule({
  messages: {
    myMessage: `
      Hello {value}!
    `,
  },
  async run(files, context) {
    context.warn("myMessage", {}, { value: "World" }) // "Hello World!"
  },
})
```

### `Bytes`

This represents some readable data whether it be a [`File`](#file),
[`FileState`](#FileState), or [`Diff`](#diff).

```ts
// Read the contents of this file/diff/etc.
await bytes.contents() // "line1/nline2"

// Does this file/diff/etc contain a string or match a regex?
await bytes.contains("string") // true/false
await bytes.contains(/regex/) // true/false
```

### `Line`

> (extends [`Bytes`](#bytes))

```ts
line.lineNumber // 42
```

### `FileState`

> (extends [`Bytes`](#bytes))

```ts
// Get the file path (relative to repo root)
file.path // "path/to/file.ext"

// Get the file's name
file.name // "file.ext"

// Get the file dirname (relative to repo root)
file.dirname // "path/to"

// Get the file basename
file.basename // "file"

// Get the file extension
file.extension // ".ext"

// Does the file path match a set of glob patterns?
file.matches("path/to/**", "{glob,patterns}") // true/false

// Parse the file as JSON
await file.json() // { ... }

// Parse the file as YAML
await file.yaml() // { ... }

// Read this file line by line
await file.lines() // [Line, Line, Line]
```

### `Diff`

```ts
// only the added lines
await diff.added() // [Line, Line, Line]

// only the removed lines
await diff.removed() // [Line, Line, Line]

// all of the changed lines
await diff.changed() // [Line, Line, Line, Line, Line, Line]

// Returns a JSONDiff of the file (assuming the file is JSON)
await diff.jsonDiff() // JSONDiff { ... }

// Returns a JSONPatch of the file (assuming the file is JSON)
await diff.jsonPatch() // JSONPatch { ... }

// Get stats on the diff (number of changed/added/removed/etc lines)
await diff.stats() // { changed: 5, added: 3, removed: 2, before: 2, after: 3 }

// Test if the diff contains changes greater than one of these thresholds
// (Thresholds are 0-1 as percentages)
await diff.changedBy({ total: 0.5 }) // true/false
await diff.changedBy({ added: 0.3 }) // true/false
await diff.changedBy({ removed: 0.2 }) // true/false
await diff.changedBy({ added: 0.3, removed: 0.2 }) // true/false
```

### `File`

> (extends [`FileState`](#filestate))

```ts
// Has the file been created?
file.created // true/false

// Has the file been deleted?
file.deleted // true/false

// Has the file been modified?
file.modified // true/false

// Has the file been edited (created or modified)?
file.edited // true/false

// Has the file been touched (created, modified, or deleted)?
file.touched // true/false

// Has the file been moved from another location?
await file.moved() // true/false

// Get the state of the file before all the changes made.
file.before() // File | null

// Get information about the diff of the file
file.diff() // Diff | null
```

### `Files`

> (extends [`Bytes`](#bytes))

```ts
// Get all of the created files.
files.created // [File, File, ...]

// Get all of the deleted files.
files.deleted // [File, File, ...]

// Get all of the modified files.
files.modified // [File, File, ...]

// Get all of the edited files.
files.edited // [File, File, ...]

// Get all of the touched files.
files.touched // [File, File, ...]

// Get all of the untouched files.
files.untouched // [File, File, ...]

// Get all files regardless of if they have been touched or not.
files.all // [File, File, ...]

// Get a specific file.
files.get("path/to/file.ext") // File | null

// Filter files by a set of glob patterns
files.matches("path/to/**", "{glob,patterns}") // Files
```
