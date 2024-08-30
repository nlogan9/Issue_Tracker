const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');
let Issue = require('../models/issue');
 

chai.use(chaiHttp);
let issue_title = "Test Issue Title"
let issue_text = "Functional Test - Create Issue with Every Field"
let created_by = "me"
let assigned_to = "Chai and Mocha"
let status_text = "This is some text about status"
let ID;

suite('Functional Tests', function() {
  test('Create Issue with Every Field', function(done) {
    chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send({
            "issue_title": issue_title,
            "issue_text": issue_text,
            "created_by": created_by,
            "assigned_to": assigned_to,
            "status_text": status_text
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.issue_title, issue_title);
            assert.equal(res.body.issue_text, issue_text);
            assert.equal(res.body.created_by, created_by);
            assert.equal(res.body.assigned_to, assigned_to);
            assert.equal(res.body.status_text, status_text);
            ID = res.body._id;
            done();
        });
  });

  test('Create Issue with Required Fields', function(done) {
    chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send({
            "issue_title": issue_title,
            "issue_text": "Functional Test - Create Issue with only Required Fields",
            "created_by": created_by
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.issue_title, issue_title);
            assert.equal(res.body.issue_text, "Functional Test - Create Issue with only Required Fields");
            assert.equal(res.body.created_by, created_by);
            done();
        });
  });

  test('Create Issue with Missing Required Fields', function(done) {
    chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send({
            "issue_text": "Functional Test - Create Issue missing Required Fields",
            "created_by": created_by
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'required field(s) missing');
            done();
        });
  });

  test('View issues on a project', function(done) {
    chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest')
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            done();
        });
  });

  test('View issues on a project with one filter', function(done) {
    chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest/?isue_title="Test Issue Title"')
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            done();
        });
  });

  test('View issues on a project with multiple filters', function(done) {
    chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest/?issue_title=Test Issue Title&created_by=me')
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            done();
        });
  });

  test('Update one field on an issue', function(done) {
    console.log(ID);
    chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send({
            "_id": ID,
            "created_by": "someone else"
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, ID);
            done();
        });
  });

  test('Update multiple fields on an issue', function(done) {
    console.log(ID);
    chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send({
            "_id": ID,
            "created_by": "someone else",
            "status_text": "This text is mostly about status"
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, ID);
            done();
        });
  });

  test('Update an issue with missing _id', function(done) {
    console.log(ID);
    chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send({
            "created_by": "someone else",
            "status_text": "This text is mostly about status"
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'missing _id');
            done();
        });
  });

  test('Update an issue with no fields to update', function(done) {
    console.log(ID);
    chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send({
            "_id": ID,
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'no update field(s) sent');
            assert.equal(res.body._id, ID);
            done();
        });
  });

  test('Update an issue with an invalid _id', function(done) {
    chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send({
            "_id": "fake _id",
            "created_by": "someone else"
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'could not update');
            assert.equal(res.body._id, 'fake _id');
            done();
        });
  });

  test('Delete an issue', function(done) {
    chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send({
            "_id": ID,
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.result, 'successfully deleted');
            assert.equal(res.body._id, ID);
            done();
        });
  });

  test('Delete an issue', function(done) {
    chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'missing _id');
            done();
        });
  });

  test('Delete an issue', function(done) {
    chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send({
            "_id": 'fake _id',
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'could not delete');
            assert.equal(res.body._id, 'fake _id');
            done();
        });
  });



});
