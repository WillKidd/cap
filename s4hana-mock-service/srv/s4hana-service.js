const cds = require("@sap/cds");

async function checkInventory(productID, requiredQuantity, tx) {
  const inventory = await tx.run(
    SELECT.one.from("mock.test.s4hana.Inventory").where({ product_ID: productID })
  );

  if (!inventory || inventory.quantity < requiredQuantity) {
    throw new Error("Item quantity exceeds inventory!");
  }
  const newQuantity = inventory.quantity - requiredQuantity;
  return newQuantity;
}

async function updateInventory(productID, newQuantity, tx){
  await tx.run(
    UPDATE.entity("mock.test.s4hana.Inventory").where({ product_ID: productID }).with({quantity: newQuantity})
  );
}

async function getProduct(productID, tx){
  return await tx.run(
    SELECT.one
      .from("mock.test.s4hana.Products")
      .where({ ID: productID})
  );
}

async function getCustomer(customerID, tx){
  return await tx.run(
    SELECT.one
      .from("mock.test.s4hana.Customers")
      .where({ ID: customerID })
  );
}

async function addOrder(order, tx){
  await tx.run(INSERT.into("mock.test.s4hana.Orders").entries(order));
}

module.exports = function () {
  this.on("submitOrder", async (req) => {
    const { customerID, items } = req.data;
    try {
      await cds.tx(async (tx) => {
        const customer = await getCustomer(customerID, tx);

        if (!customer) {
          throw new Error("Customer not found!");
        }

        let totalAmount = 0;
        for (const item of items) {
          const product = await getProduct(item.product_ID, tx);
          const newQuantity = await checkInventory(product.ID, item.quantity, tx);
          console.log(newQuantity);
          await updateInventory(product.ID, newQuantity, tx);
          totalAmount += product.price * item.quantity;
        }

        const Order = {
          customer_ID: customerID,
          orderDate: new Date().toISOString(),
          totalAmount: totalAmount,
          status: "Pending",
          items: items,
        };

        await addOrder(Order, tx);
      }); // cds.tx
    } catch (error) {
      console.error(error.message);
    }
  }); // submitOrder

  this.on("cancelOrder", async (req) => {
    const { orderID } = req.data;
    await cds.tx(async (tx) => {
      const order = await tx.run(
        SELECT.one.from("mock.test.s4hana.Orders").where({ ID: orderID })
      );
      if (order.status !== "Pending") {
        throw new Error("Order can't be canceled!");
      } else {
        await tx.run(
          DELETE.from("mock.test.s4hana.Orders").where({ ID: orderID })
        );
      }
    });
  }); // cancelOrder
};
