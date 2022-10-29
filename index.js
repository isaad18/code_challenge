const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const db = require('./queries')

app.get('/users', db.getUsers)
app.get('/users/:username', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:username', db.updateUser)
app.delete('/users/:username', db.deleteUser)
app.set('view engine', 'ejs');
app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data

// Home page
app.get('/', (req, res) => {
  res.render('index');
});

// API tests page
app.get('/api-test', (req, res) => {
  res.render('api-tests/test-list', {loginError: false});
});

// Function that gets a response from the codewars API
// Parameter is codewars login
// This is currently only checking the first page of results
const getChallengeList = (codewarsLogin) => {
  const result = axios.get(`https://www.codewars.com/api/v1/users/${codewarsLogin}/code-challenges/completed?page=0`)
  .then(response => {
    return response.data.data;
  }).catch(() => null);
  return result;
};

// Get information for a single challenge
const getChallengeInfo = (challengeName) => {
  const result = axios.get(`https://www.codewars.com/api/v1/code-challenges/${challengeName}`)
  .then(response => {
    return response.data;
  }).catch(() => null);
  return result;
};

// Post request to get info on a single challenge
app.post('/challenge-info', async (req, res) => {
  const response = await getChallengeInfo(req.body.challengeName);
  // We are interested in name, URL, category, description
  res.render('api-tests/challenge-info', {...response, challengeNotFound: !response});
});

// Post request to check that a given challenge has been completed by a user
app.post('/has-completed', async (req, res) => {
  let data = {'completed': false, 'date' : null};  
  const response = await getChallengeList(req.body.name);
  if (response)
  {
    const completed = response.map(i => i.slug).includes(req.body.challenge.trim());
    data.completed = completed;
    if (completed)
    {
      response.forEach(item => {
        if (item.slug == req.body.challenge.trim())
        {
          data.date = new Date(item.completedAt);
        }
        // We can also check the languages the challenge was completed
        // in here
        // item.completedLanguages.forEach(Any callback function)
      });

      // Some functions we can use on the date object
      // console.log(completionDate.getSeconds());
      // console.log(completionDate.getMinutes());
    }
    res.render('api-tests/challenge-complete', data);
  }
  else
  {
    res.render('api-tests/test-list', {loginError: true});
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  console.log(`API tests on http://localhost:${port}/api-test`);
});