const Contact = require('../models/ContactModel');

const createContact = async (data) => {
  const contact = new Contact(data);
  return await contact.save();
};

const getContacts = async () => {
  return await Contact.find();
};


module.exports = {
  createContact,
  getContacts
};
