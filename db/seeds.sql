INSERT INTO department (name)
VALUES
    ('Custodial'),
    ('Sales'),
    ('Accounting');

INSERT INTO role (title, salary, department_id)
VALUES
    ('Janitor', 50000, 1),
    ('Sales Lead', 70000, 2),
    ('Sales Manager', 90000, 2),
    ('Billing', 8000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Laura', 'Thauberger', 4, null),
    ('Will', 'Smith', 2, 3),
    ('Jackson', 'Scott', 3, null),
    ('Mason', 'Stiffler', 1, null);