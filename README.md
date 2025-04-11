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
- Other tools: Microsoft Azure, GitHub
## Deployment
### 1. Prerequisites:
Install [VS Code](https://code.visualstudio.com/), [Node.js](https://nodejs.org/en) and [Microsoft Azure](https://azure.microsoft.com/en-ca/pricing/purchase-options/azure-account/search?ef_id=_k_Cj0KCQiA-5a9BhCBARIsACwMkJ7jixTq_2VhYRYXeGbxo4Rqaxvroxjl1jVBMdPq5w7b0cba0n6F4REaAgW0EALw_wcB_k_&OCID=AIDcmmqz3gd78m_SEM__k_Cj0KCQiA-5a9BhCBARIsACwMkJ7jixTq_2VhYRYXeGbxo4Rqaxvroxjl1jVBMdPq5w7b0cba0n6F4REaAgW0EALw_wcB_k_&gad_source=1&gclid=Cj0KCQiA-5a9BhCBARIsACwMkJ7jixTq_2VhYRYXeGbxo4Rqaxvroxjl1jVBMdPq5w7b0cba0n6F4REaAgW0EALw_wcB). Make sure that both Apache and MySQL servers are running.
### 2. Cloning Repository:
Open **VS Code**, then open the terminal (`Ctrl + ~` or **View > Terminal**).  
Run the following command to clone the repository:  

```sh
git clone https://github.com/yourusername/ChatHaven.git
cd ChatHaven
``` 
### 3. Install Dependencies:
Within the fronten folder run the following command:
```sh
npm install
```
### 4. Set Up Database:
Create mySQL resource on Microsoft Azure. Modify server.js file to communicate with azure mySQL database.

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
within the frontend and backend folder run the following command:
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
http://localhost:3000/home
```
## User Guide
- To access admin login: 
    - Email: Ulysse
    - password: abc

- To access member login: 
    Enter any username and password
## Roles for Sprint 1
- Scrum Master: Yénita Aman
- Secretary: Alexandre Raymond
- Product Owner(s): Elliot Vinet, Paria Jafarian  
- Development member(s): Ulysse Allard, Zachary Cohen

    - Yénita Aman (backend)
    - Alexandre Raymond (backend and frontend)
    - Elliot Vinet (backend)
    - Paria Jafarian (frontend)
    - Ulysse Allard (backend and frontend)
    - Zachary Cohen (backend and frontend)

  
## Roles for Sprint 2
- Scrum Master: Zachary Cohen
- Secretary: Ulysse Allard
- Product Owner(s): Alexandre Raymond
- Development member(s): Paria Jafarian, Yénita Aman, Elliot Vinet
      
    - Yénita Aman (backend)
    - Alexandre Raymond (backend and frontend)
    - Elliot Vinet (backend and frontend)
    - Paria Jafarian (frontend)
    - Ulysse Allard (backend and frontend)
    - Zachary Cohen (backend)
  
## Roles for Sprint 3
- Scrum Master: Elliot Vinet
- Secretary: Paria Jafarian
- Product Owner(s): Yénita Aman
- Development member(s): Zachary Cohen, Ulysse Allard, Alexandre Raymond
      
    - Yénita Aman (backend and frontend)
    - Alexandre Raymond (backend and frontend)
    - Elliot Vinet (backend and frontend)
    - Paria Jafarian (backend and frontend)
    - Ulysse Allard (backend and frontend)
    - Zachary Cohen (backend)
      
## Roles for Sprint 4
- Scrum Master: Ulysse Alard
- Secretary: Yenita Aman
- Product Owner(s): Zachary Cohen
- Development member(s): Paria Jafarian, Elliot Vinet, Alexandre Raymond
      
    - Yénita Aman (backend and frontend)
    - Alexandre Raymond (backend and frontend)
    - Elliot Vinet (backend and frontend)
    - Paria Jafarian (backend and frontend)
    - Ulysse Allard (backend and frontend)
    - Zachary Cohen (backend)
