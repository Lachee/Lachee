#!/bin/bash
watch=''
mode='--mode development'
while getopts ":wp" opt; do
  case $opt in
    w)
      watch='--watch'
      ;;
    p)
      mode='--mode production'
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      ;;
  esac
done

echo "Building $mode $watch...";
rm -fR ./dist/
npx webpack --config webpack.config.js $mode $watch
echo 'Done.';