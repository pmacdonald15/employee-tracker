
const express = require('express');
const res = require('express/lib/response');
const db = require('./db/connection');

const inquirer = require('inquirer');
const { allowedNodeEnvironmentFlags } = require('process');
require('console.table');

const PORT = process.env.PORT || 3001;
const app = express()

//express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


//connect the sql server to sql database
db.connect (function (err) {
    if (err) throw err;
    firstPrompt();
})

//function allows user to obtain information
function firstPrompt() {
    inquirer.prompt({
            type: 'list',
            name: 'task',
            message: 'Please select function you would like to do.',
            choices: [
                "View All Employees",
                "View Employees by Department",
                "Add Employee",
                "Remove Employee",
                "Update Employee Role",
                "Add Role",
                "Add Department",
                "Exit"
            ]
        })
        .then(function ({ task }) {
            switch (task) {
                case "View All Employees":
                    viewEmployees();
                    break;
                case "View Employees by Department":
                    viewEmployeesDepartment();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Remove Employees":
                    removeEmployees();
                    break;
                case "Update Employee Role":
                    updateEmployeeRole();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Add Department":
                    addDepartment();
                    break;
                case "Exit":
                    db.end();
                    break;
            }
        });
}



//view all employees
function viewEmployees() {
    let query = 
    `SELECT 
        employee.id, 
        employee.first_name, 
        employee.last_name, 
        role.title, 
        department.name AS department, 
        role.salary, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role
        ON employee.role_id = role.id
    LEFT JOIN department
        ON department.id = role.department_id
    LEFT JOIN employee manager
        ON manager.id = employee.manager_id`

    db.query(query, (err, res) => {
        if (err) throw err;

        console.table(res);
        firstPrompt();
    });
}

//view employees by department
function viewEmployeesDepartment() {
    let query =
    `SELECT 
        department.id, 
        department.name, 
        role.salary
    FROM employee
    LEFT JOIN role 
        ON employee.role_id = role.id
    LEFT JOIN department
        ON department.id = role.department_id
    GROUP BY department.id, department.name, role.salary`;

    db.query(query,(err, res) => {
        if (err) throw err;
        const deptChoices = res.map((choices) => ({
            value: choices.id, name: choices.name
        }));

        console.table(res);
        getDept(deptChoices);
    });
}

//obtains departments for show employees by department.
function getDept(deptChoices) {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'department',
                message: 'Departments: ',
                choices: deptChoices
            }
        ]).then((res)=>{ 
        let query = `SELECT 
                        employee.id, 
                        employee.first_name, 
                        employee.last_name, 
                        role.title, 
                        department.name
                    FROM employee
                    JOIN role
                        ON employee.role_id = role.id
                    JOIN department
                        ON department.id = role.department_id
                    WHERE department.id = ?`

        db.query(query, res.department,(err, res) => {
            if (err) throw err;
            firstPrompt();

            console.table(res);
        });
    })
}

//add a new employee
function addEmployee() {
    let query = 
    `SELECT 
        role.id, 
        role.title, 
        role.salary 
    FROM role`

        db.query(query, (err, res) => {
            if (err) throw err;
            const role = res.map(({ id, title, salary }) => ({
            value: id, 
            title: `${title}`, 
            salary: `${salary}`
    }));
        console.table(res);
        employeeRoles(role);
    });
}

//obtains employee roles for addEmployee
function employeeRoles (role) {
    inquirer
        .prompt([
        {
            type: "input",
            name: "firstName",
            message: "Employee First Name: "
        },
        {
            type: "input",
            name: "lastName",
            message: "Employee Last Name: "
        },
        {
            type: "list",
            name: "roleId",
            message: "Employee Role: ",
            choices: role
        }
        ]).then((res) => {
            let query = `INSERT INTO employee SET ?`

        db.query(query,{
        first_name: res.firstName,
        last_name: res.lastName,
        role_id: res.roleId
        }, (err, res) => {
        if (err) throw err;
        firstPrompt();
        });
    });
}

//removes employee
function removeEmployees() {
    let query =
    `SELECT
        employee.id, 
        employee.first_name, 
        employee.last_name
    FROM employee`

    db.query(query, (err, res) => {
        if (err) throw err;
        const employee = res.map(({ id, first_name, last_name }) => ({
            value: id,
            name: `${id} ${first_name} ${last_name}`
        }));
        console.table(res);
        getDelete(employee);
    });
}

function getDelete (employee) {  
    inquirer
        .prompt([
            {
            type: "list",
            name: "employee",
            message: "Employee To Be Deleted: ",
            choices: employee
            }
        ]).then((res) => {
            let query = `DELETE FROM employee WHERE ?`;

        db.query(query, { id: res.employee }, (err, res) => {
        if (err) throw err;
        firstPrompt();
        });
    });
}

//updates employee role
function updateEmployeeRole() {
    let query = `SELECT 
                    employee.id,
                    employee.first_name, 
                    employee.last_name, 
                    role.title, 
                    department.name, 
                    role.salary, 
                    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                FROM employee
                JOIN role
                    ON employee.role_id = role.id
                JOIN department
                    ON department.id = role.department_id
                JOIN employee manager
                    ON manager.id = employee.manager_id`

    db.query(query,(err, res) => {
        if (err) throw err;
        const employee = res.map(({ id, first_name, last_name }) => ({
            value: id,
            name: `${first_name} ${last_name}`      
        }));

        console.table(res);
        updateRole(employee);
    });
}

function updateRole(employee) {
    let query = 
    `SELECT 
        role.id, 
        role.title, 
        role.salary 
    FROM role`

    db.query(query,(err, res) => {
        if (err) throw err;
        let roleChoices = res.map(({ id, title, salary }) => ({
        value: id, 
        title: `${title}`, 
        salary: `${salary}`      
        }));
        
    console.table(res);

    getUpdatedRole(employee, roleChoices);
    });
}

function getUpdatedRole(employee, roleChoices) {
    inquirer
        .prompt([
        {
            type: "list",
            name: "employee",
            message: `Employee who's role will be Updated: `,
            choices: employee
        },
        {
            type: "list",
            name: "role",
            message: "Select New Role: ",
            choices: roleChoices
        },

        ]).then((res) => {
        let query = `UPDATE employee SET role_id = ? WHERE id = ?`

        db.query(query,[ res.role, res.employee],(err, res) => {
            if (err) throw err;
            firstPrompt();
        });
    });
}

//add new role
function addRole() {
    var query = 
        `SELECT 
        department.id, 
        department.name, 
        role.salary
        FROM employee
        JOIN role
        ON employee.role_id = role.id
        JOIN department
        ON department.id = role.department_id
        GROUP BY department.id, department.name`

    db.query(query,(err, res) => {
        if (err) throw err;
        const department = res.map(({ id, name }) => ({
            value: id,
            name: `${id} ${name}`
        }));

        console.table(res);
        addToRole(department);
    });
}

function addToRole(department){
    inquirer
        .prompt([
            {
            type: "input",
            name: "title",
            message: "Role title: "
            },
            {
            type: "input",
            name: "salary",
            message: "Role Salary: "
            },
            {
            type: "list",
            name: "department",
            message: "Department: ",
            choices: department
            },
        ]).then((res) => {
            let query = `INSERT INTO role SET ?`;

        db.query(query, {
            title: res.title,
            salary: res.salary,
            department_id: res.department
        }, (err, res) => {
            if (err) throw err;
            firstPrompt();
        });
    });
}

//add new department

function addDepartment() {
    inquirer
        .prompt([
            {
            type: "input",
            name: "name",
            message: "Department Name: "
            }
        ]).then((res) => {
        let query = `INSERT INTO department SET ?`;

        db.query(query, {name: res.name},(err, res) => {
            if (err) throw err;
            
            firstPrompt();
        });
    });
}

//default response 
app.use((req, res) => {
    res.status(404).end();
});


db.connect(err => {
    if (err) throw err;
    console.log('Database connected.');
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
});