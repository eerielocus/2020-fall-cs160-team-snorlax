// Edit to the musings below:
// I think I finally get how this funciton works. In short, it is trying to
// find what you want (the items in relArray). I'll illustrate it with the
// example of how it's used in loadFromServer with a single element list trying
// to find the relation "employees" [{rel: "employees", params: pageSize}]
//
// For this example,
// api = client -- the client object to communicate with the server
// rootPath = /api
// relArray = [{rel:"employees", parmas: pageSize}]
//
// First the function gets the root json object by making a GET request to
// the api with the rootPath. That gives an object with
// json = { "_links" : { ... }
// }
//
// the reduce function (foldl') folds relArray, in our case the single element
// relation looking for "employees" with params: pageSize, and ends up calling
// traverseNext with json (the object we found above), "employees", and the
// Map with the params in it. It first checks to see if json has an "_embedded"
// key, which it does not. It moves next to see if it has "_links", which it
// does. It then knows it needs to work with "_links" to find "employees", so
// it asks the api to GET the link found at _links["employees"].href, which
// is http://localhost:8080/api/employees, and also use the params found in
// arrayItem.params (i.e. pageSize). The result is the json object that
// includes the list of employees with the appropriate page size.
//
// It is my belief that the return value from traverseNext would be fed into
// the next item in relArray if there was another one, to find additional
// relations after that (so you can find "last" for instance), in this case,
// we are done, so the follow function returns the json object that
// traverseNext found.
//
// api -- the api that fetches information from the server (i.e. client object)
// rootPath -- a path to the root (i.e. '/api')
// relArray -- a relationship array; as an example, 'employees' is a
// relationship that could be an item of this array. Because JavaScript is
// weird, array items can also be of different type than string -- they can
// be dictionaries with a rel key where the relationship is the value of
// arrayItem.rel (hence all of the checks like typeof arrayItem === 'string')
module.exports = function follow(api, rootPath, relArray) {
  // get the json object of the relation
  const root = api({
    method: 'GET',
    path: rootPath
  });

  // equivalent Haskell:
  // foldl' traverseNext root relArray
  return relArray.reduce(function(here, arrayItem) {
    const rel = typeof arrayItem === 'string' ? arrayItem : arrayItem.rel;
    return traverseNext(here, rel, arrayItem);
  }, root);

  // Note: while it may seem strange to have a folding function, which is what
  // traverseNext is, have 3 parameters instead of the usual 2, the reason why
  // is because this JavaScript code needs to know if you're working with a
  // string or Map because if it's a Map, you need to check the params, too.
  // In Haskell, you wouldn't (coudln't even) do something like that, you
  // would instead fold the "it might have params or not" into the type system
  // with a tuple (JSON, Maybe [Text]) or perhaps a Data type.
  // noted previously, the JSON object that this function is passed in
  // and returns are actually wrapped in the Promise monad (I think), and I
  // believe that doing here.then(...) is like doing here >>= \json -> (...)
  // in Haskell, or like doing json <- root in do notation.
  // The actual type of traverseNext is probably something like:
  // traverseNext :: Promise JSON -> Relation -> ArrayItem -> Promise JSON
  // but for simplicity:
  // traverseNext :: JSON -> Relation -> ArrayItem -> JSON
  function traverseNext (here, rel, arrayItem) {
    return here.then(function (response) {
      // if the entity has this relation, go there next
      if (hasEmbeddedRel(response.entity, rel)) {
        return response.entity._embedded[rel];
      }

      // if the entity does not have a _links key, there is nowhere else
      // to go
      if(!response.entity._links) {
        return [];
      }

      // if none of the above cases are true, then either the relation
      // is a string or a dictionary with a relation and params. If it is
      // just a string, go there. If it is a dictionary, go to the relation
      // location using the specified params
      if (typeof arrayItem === 'string') {
        return api({
          method: 'GET',
          path: response.entity._links[rel].href
        });
      } else {
        return api({
          method: 'GET',
          path: response.entity._links[rel].href,
          params: arrayItem.params
        });
      }
    });
  }

  // this function checks whether the given entity (which is a dictionary)
  // has an _embedded key and whether that _embedded key has this
  // relationship as a key
  function hasEmbeddedRel (entity, rel) {
    return entity._embedded && entity._embedded.hasOwnProperty(rel);
  }
};
