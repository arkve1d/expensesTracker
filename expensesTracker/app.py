#chatgpt used to alter comments i already wrote, to make them more concise. they were a bit wordy before

# This section establishes a connection to SQLite. It's technically more OOP in nature,
# but simplifies function calls by avoiding repetitive a.b.c.d style access.
import sqlite3
dbConnect = sqlite3.connect('expenses.db')  # Creates a connection to the SQLite database file.
                                            # Automatically creates the file if it doesn’t exist.
cursor = dbConnect.cursor()  # Creates a cursor object that acts as a pointer between Python and the SQLite engine,
                             # pipelining SQL commands and results through the active database connection.

# This creates the database table if it does not already exist.
cursor.execute('''
CREATE TABLE IF NOT EXISTS spends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total REAL NOT NULL
)
''')
dbConnect.commit()  # Commits the change to the database connection.


# Defines lists to be used later for data handling.
expenses = []
spending = []


# Determines how many different expenses the user wants to record in one session, limited to 100.
# Loops until valid input is provided.
while True:
    try:  # Prevents program failure if invalid input is encountered.
        count = int(input('how many different expenses would you like to track? 1-100:'))  # Identifies upper counter limit.
        if 1 <= count <=100:
            break
    except ValueError:  # Error handler for non-integer input.
        print('Error: exclusively an integer between 1 and 100 must be entered.')

i = 1  # Defines counter start.

# Loops from 1 until the count specified by the user.
while i <= count:
    try:
        expenses.append(float(input(f'enter expense {i}: £')))  # Adds the entered expense to the list.
        if expenses[-1] <= 0:  # Checks if the most recently added value is less than or equal to 0.
            expenses.pop()  # Removes invalid values.
            print('Expense entered must be over £0')
            continue  # Does not increment the counter but continues the loop.
        i +=1
    except ValueError:
        ('Error: exclusively float value to be entered')


totalExpense = sum(expenses)
print(f'the total of your expenses is £{totalExpense}')

if totalExpense > 100:
    print('This transaction will require manager approval')  # Conditional for larger expense totals.
    # Not implementing any “manager” logic here.

else:  # If manager approval is not required.
    while True:  # Loops until user provides confirmation input.
        confirmation = input('Would you like to confirm this spending? \n Y/N:')
        if confirmation == 'Y':
            spending.append(totalExpense)  # Adds the expense total to a separate list.
            spending = tuple(spending)  # Reassigns spending to a tuple to prevent further modification.
            print('Confirmed.\nSaved expense to spending.')
            print(spending)  # Verification print to confirm saving worked as intended.

            # Adds persistence by saving the expense total to the SQLite database.
            cursor.execute('INSERT INTO spends (total) VALUES (?)', (totalExpense,))  # Inserts totalExpense into the database.
                                                                                     # The question mark acts as a placeholder for safe value substitution.
            dbConnect.commit()  # Commits this change to the database connection.
            print('Database save successful.')

            break  # Ends confirmation loop.
        elif confirmation == 'N':
            print('Aborted.')
            break  # Transaction cancelled.
        else:
            print('Enter exactly Y or N.')
            continue  # Continues looping until valid input (Y/N) is entered.

# Attempting to stay procedural rather than object-oriented; a function could help here but not required.


# After everything has executed, retrieve the lifetime total from the database.
# cursor.execute runs the SQL command through the cursor using the current connection.
cursor.execute('SELECT SUM(total) FROM spends')  # SUM is an aggregate function that returns one value across all rows.
lifetimeSpend = cursor.fetchone()[0]  # fetchone() retrieves the single-row result as a tuple; index [0] extracts the numeric value.
if lifetimeSpend is None:  # Required in case the database has no previous entries (fetchone returns None in this case).
    lifetimeSpend = 0 
print(f'Your recorded lifetime spend is £{lifetimeSpend:2f}')  # Uses f-string formatting to display two decimal places.
                                                               # Read-only operation, so rounding a variable is unnecessary here.

# No commit required here as this section only reads from the database.