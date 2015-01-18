types=(patch minor major)

mkdir -p src

trim() {
  echo $1 | sed -e 's/^ *//g' -e 's/ *$//'
}

errors_count=0
errors_output=""

assert() {
  if [ "$(trim $(cat $1))" != "$(trim $(cat $2))" ]; then
    printf 'F'

    errors_count=($errors_count + 1)
    errors_output="$errors_output
\`$1\` == \`$2\`\n
diff: $(diff $2 $1)\n\n"
  else
    printf '.'
  fi
}

for type in patch minor major; do
  cp -r ./fixtures/* ./src

  node ../yabs.js $type -f src/test.json -k version
  node ../yabs.js $type -f src/test.plist -k version
  node ../yabs.js $type -f src/test.version -r r/\$version/

  for ext in json plist version; do
    assert ./src/test.$ext ./expect/$type/test.$ext
  done
done

echo "\n"
echo $errors_output
echo $errors_count tests failed...

rm -rf ./src
