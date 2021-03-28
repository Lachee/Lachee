#!/bin/bash
watch=''
while getopts ":w" opt; do
  case $opt in
    w)
      watch='--watch'
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      ;;
  esac
done

echo 'Building...';
rm -fR ./dist/
npx webpack --config webpack.config.js $watch
echo 'Done.';