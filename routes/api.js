'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser  = require('body-parser');

let Issue = require('../models/issue');

mongoose.connect(process.env.MONGO_URI);

module.exports = function (app) {

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      let request = req.query;
      console.log(request);
      let query = 'Issue.find({ project: project })'
      for (let x in request) {
        query += `.where('${x}').equals('${request[x]}')`
      }
      query += '.exec()';
      //console.log(query);
      try{
      const issues = await eval(query);
      console.log(issues);
      //console.log(req.query);
      res.json(issues);
      } catch (err) {
        res.json(err.message);
        console.log(err.message);
      }
    })
    
    .post(async function (req, res) {
      let project = req.params.project;
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      console.log("post project to /api/issues/:project", req.body);
      let newissue = new Issue({
        project: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        open: true,
        created_on: new Date(),
        updated_on: new Date()
      });


      try{
        const saveIssue = await newissue.save();
        const newID = saveIssue._id;
        console.log(newID);
        const result = await Issue.findById(newID).select(['_id', 'issue_title', 'issue_text', 'created_on', 'updated_on', 'created_by', 'assigned_to', 'open', 'status_text']).exec();
        console.log(result);
        res.json(result);
      } catch (err) {
        res.json(err.message);
        console.log(err.message);
      }
    })
    
    .put(async function (req, res){
      let project = req.params.project;
      if (!req.body._id) {
        return res.json({ error: 'missing _id'});
      };
      console.log("put project to api/issues/:project ", req.body);
      let update = {};
      for (let x in req.body) {
        if (req.body[x]) {
          update[x] = req.body[x];
        }
      }
      console.log("update object: ", update);
      console.log("update object length", Object.keys(update).length);
      if (Object.keys(update).length === 1) {
        return res.json({
          error: 'no update field(s) sent',
          _id: req.body._id
        });
      }
      update.updated_on = new Date();
      console.log(update);
      try {
        const updateIssue = await Issue.findByIdAndUpdate(req.body._id, update);
        if (updateIssue) {
          res.json({ result: 'successfully updated', _id: req.body._id });
        } else {
          res.json({ error: 'could not update', _id: req.body._id });
        }
      }catch (err) {
        res.json({ error: 'could not update', _id: req.body._id });
      }
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      if (!req.body._id) { return res.json({ error: 'missing _id' })};
      console.log("delete id: ", req.body._id);
      let delID = req.body._id;
      try {
        const deleteIssue = await Issue.deleteOne({ _id: delID });
        console.log(deleteIssue);
        if (deleteIssue.deletedCount === 1) {
          res.json({ result: 'successfully deleted', _id: delID });
        } else {res.json({ error: 'could not delete', _id: delID }); }
      } catch (err) {
        res.json({ error: 'could not delete', _id: delID });
      }
    });
    
};
