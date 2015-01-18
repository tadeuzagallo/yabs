types=(patch minor major)
tests_count=0
errors_count=0
errors_output=""

trim() {
  $1
}

check() {
  echo "$(cat $1 | sed -e 's/^ *//' -e 's/ *$//')" | md5
}

assert() {
  ((tests_count+=1))

  if [ "$(check $1)" != "$(check $2)" ]; then
    printf 'F'

    ((errors_count+=1))
    errors_output="$errors_output
\`$1\` == \`$2\`\n
diff: $(diff $2 $1)\n\n"
  else
    printf '.'
  fi
}

do_assert() {
  for ext in json plist version; do
    assert ./src/test.$ext ./expect/$1/test.$ext
  done
}

copy() {
  cp -r ./fixtures/* ./src
}

run(){
mkdir -p src

for type in patch minor major; do
  copy

  node ../yabs.js $type -f src/test.json -k version
  node ../yabs.js $type -f src/test.plist -k version
  node ../yabs.js $type -f src/test.version -r r/\$version/

  do_assert $type

  copy

  node ../yabs $type

  do_assert $type
done

echo "\n"
succeeded=$(($tests_count - $errors_count))
echo $errors_output

echo $succeeded passing
if [ $errors_count -gt 0 ]; then
  echo $errors_count failing
fi

rm -rf ./src
}

time run
