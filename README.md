# CISC-3140-Group-Project

## Overview
This webapp will allow users to make an account and maintain a personal list of their favorite movies. Users can search for a movie they watched. When a movie is selected they will be prompted to perform a pre-selection; they will be asked whether they loved the movie, thought it was okay, or hated it. After the preselection the user will be prompted to perform direct comparisons to other movies they already added to their list. A movies placement in the list is determined by the result of these direct comparisons.

## Presentation
https://docs.google.com/presentation/d/15hJEZBtsnRDANrSniqalDzRCcW8giDKshxtgBAzvrDY/edit#slide=id.g2f2fde61483_2_9

## Features 
1. We have a search bar which is connected to our database, it displays movie names based on the users query.
3. A sign up and sign in system was created with our database, and some other packages.
5. Our movie ranking system allows for a better list than one based off an arbitrary number score.
6. Click on a movie in the search result and you will begin the ranking process.
7. Add other users as friends and view their movies lists as well on the profile page.

## Roles
Michael: Project Manager,
  Implemented the search bar, designed the basic home page layout, reworked the backend to assist with database implementation, reworked the login feature and added session tokens, implemented the movie list display, various styling changes. 
  
Adolfo: Backend, 
  Implemented initial backend and account creation feature, created initial log in page, created profile page and friends list feature, implemented add friends and view friends movie list feature, made many backend changes.  
  
Joseph: Frontend,,
  Created initial design for the user movie list, made a design for the movie ranking menu, wrote logic to display list items on the page, designed pop-up ranking menu, many styling changes.  
  

## Getting Started
To load the repository run this command in your local project directory.
```bash
git clone https://github.com/mikey1201/CISC-3140-Group-Project.git
```
Before you start working and before you commit pull to make sure your working on the latest version.
```bash
git pull origin main
```
After you make changes be sure to commit the changes.
```bash
git commit -m "your commit message"
```
Sometimes changes are not added with your commit you made need to add a file manually and commit again.
```bash
git add file/directory
```
To push the change to changes to github run this command.
```bash
git push -u origin main
```
If you have any questions ping me on discord.
