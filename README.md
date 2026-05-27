…or create a new repository on the command line

echo "# bchon_client" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M develop
git remote add origin https://github.com/swiftwaresolutions/bchon_client.git
git push -u origin develop

…or push an existing repository from the command line

git remote add origin https://github.com/swiftwaresolutions/bchon_client.git
git branch -M develop
git push -u origin develop