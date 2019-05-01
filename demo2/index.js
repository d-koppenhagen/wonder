var wonder = new window.Wonder.Wonder();

wonder.login('user@localhost:9110')
  .then(function(data) {
    console.log(data);
  })
  .catch(function(error) {
    console.log(error);
  });
