var inquirer = require("inquirer");
var mysql = require("mysql");
var consoleTable = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Lostknife17",
    database: "bamazonDB"
  });
  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    loadProducts();
  });

    function loadProducts() {
        var query = 'SELECT * FROM products';
        connection.query(query, function(err, res) {
            if (err) throw err;
            // Log all results of the SELECT statement
            console.log("\n" + "*Start new order*" + "\n" + "Available items for purchase:" + "\n")
            console.table(res);
            customerPrompt(res);
        });
    };

    function customerPrompt(inventory) {
        inquirer
        .prompt([
            {
                type: "input",
                message: "What is the item id you want to bid on?.",
                name: "itemChoice"
            },
            {
                type: "input",
                message: "How many of this item do you want to bid on?.",
                name: "itemQuantity"
            },
        ])
        .then(function(val) {
            let choiceId = parseInt(val.itemChoice);
            let itemQuant = parseInt(val.itemQuantity); 
            checkInventory(inventory, choiceId, itemQuant);
        });
    }

    function checkInventory(inventory, choiceId, itemQuant) {
        for (var i=0; i < inventory.length; i++) {
            if (inventory[i].item_id === choiceId) {
                let choiceId = inventory[i];
                if (itemQuant <= choiceId.stock_quantity) {
                    console.log("In stock!")
                    fulfillOrder(choiceId, itemQuant);
                } else {
                    console.log("Not enough in stock. Remaining in stock = " + choiceId.stock_quantity);
                    loadProducts();
                }
            } 
        }
    }

    function fulfillOrder(choiceId, quantity) {
        var orderTotalPrice = choiceId.price * quantity
        console.log("Total cost of order = $" + orderTotalPrice)
        var newQuantity = choiceId.stock_quantity - quantity
        // update sql db
        connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: newQuantity
              },
              {
                item_id: choiceId.item_id
              }
            ],
            function(error) {
              if (error) throw error;
              console.log("Order placed successfully!");
              loadProducts();
            }
        );

    }