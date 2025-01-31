# PlanetExpress SOEN341: ChatHaven Project W25

## Description of the project
In today's world communication has never been more crucial, however many existing platforms lack versatility, visual appeal or secure interactions.

Our project, ChatHaven, addresses these issues by providing a simple and user-friendly communication platform  allowing exchanges via text channels or direct messages. Whether for private conversations or team collaborations, ChatHaven offers efficient, organized and secure communication to all its users.
## Team members (6)
- Yénita Aman
- Alexandre Raymond
- Zachary Cohen
- Ulysse Allard
- Elliot Vinet
- Paria Jafarian

## Table of Contents
- [Features](#features)
- [Technologies used](#technologies-used)
- [Deployment](#deployment)
- [User guide](#user-guide)
- [Roles for Sprint 1](#roles-for-sprint-1)
- [Roles for Sprint 2](#roles-for-sprint-2)
- [Roles for Sprint 3](#roles-for-sprint-3)
- [Roles for Sprint 4](#roles-for-sprint-4)

## Features
- Dual authentication, users can log in as members or administrators
- Direct messages
- Creation of text channels
## Technologies Used
- Frontend development: HTML,CSS, React and JavaScript
- Backend development: Node.js,Express
- Database: MySQL
- Other tools: XAMPP, GitHub
## Deployment
### 1. Prerequisites:
Install [VS Code](https://code.visualstudio.com/), [Node.js](https://nodejs.org/en) and [XAMPP](https://www.apachefriends.org/). Make sure that both Apache and MySQL servers are running.
### 2. Cloning Repository:
Open **VS Code**, then open the terminal (`Ctrl + ~` or **View > Terminal**).  
Run the following command to clone the repository:  

```sh
git clone https://github.com/yourusername/ChatHaven.git
cd ChatHaven
``` 
### 3. Install Dependencies:
```sh
npm install
```
### 4. Set Up Database:
Start XAMPP and enable Apache & MySQL.
Open phpMyAdmin (http://localhost/phpmyadmin/).

Create a new database:
- Click New > Enter database name (" ") > Click Create.
- Import the database schema:
    - Go to the Import tab.
    - Select the provided .sql file.
    - Click Go to execute the import.

### 5. Environment
Create an **env.** file by running:
```sh
touch .env
```
### 6. Start the server
Run the following command:
```sh
npm start
```
If using nodemon run:
```sh
npm run dev
```
### 7. Access web application
Go to:
```sh
http://localhost:3000
```
## User Guide
- To access admin login: 
    - Email: john.doe@email.com
    - password: admin1234

- To access member login: 
    - Email: jane.doe@email.com
    - password: member1234
## Roles for Sprint 1
- Scrum Master: Yénita Aman
- Secretary: Alexandre Raymond
- Product Owner(s): Elliot Vinet, Paria Jafarian
- Development member(s): Ulysse Allard, Zachary Cohen
## Roles for Sprint 2
To be defined.
## Roles for Sprint 3
To be defined.
## Roles for Sprint 4
To be defined.