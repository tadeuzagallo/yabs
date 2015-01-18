# YABS - Yet Another Bump Script

`yabs` is a fully customisable script tool that allows you to bump as many files as you want!

`yabs` supports `.json` and `.plist` files out of the box, alternativelly you can use an `regexp` to bump __any__ file!

## Usage

You can use it passing arguments or just create an `.yabsrc` file on the root of the target project

### CLI

```sh
$ yabs [type] [-f file (-k key | -r pattern) ]

  type        Type of bump: patch, minor or major
  -f file     Path to the file you want to bump
  -k key      Key to be bumped. (default: version)
  -r pattern  Pattern to match version on arbitrary file. Use $version to represent the actual version inside the pattern
                e.g. r/version: $version/
```

### .yabsrc

Here's in an example of `.yabsrc`:

```js
{
  "package.json": "version",
  "bower.json": "version",
  "osx/Info.plist": "CFBundleVersion",
  "misc/version.info": "r/version: $version/"
}
```
