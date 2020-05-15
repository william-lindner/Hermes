<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <meta
        http-equiv="X-UA-Compatible"
        content="IE=edge"
    />
    <title>Simple XHR Demo Page</title>
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    />

</head>

<body>
    <div id="root">Hello!</div>
    <script src="src/index.js"></script>
    <script>
        hermes
            .put("https://jsonplaceholder.typicode.com/posts/1", {
                expect: "json",
                params: {
                    userId: 1,
                    body: "Another note!",
                },
            })
            .then(function(response) {
                console.log('Then', response);
            })
            .catch(function(response) {
                console.log('Catch', response);
            })
            .finally(function(response) {
                console.log('Finally', response);
            });

        hermes.get("https://jsonplaceholder.typicode.com/todos/1", {
                expect: "json"
            })
            .then(function(response) {
                console.log('get', response)
            });
    </script>
</body>

</html>