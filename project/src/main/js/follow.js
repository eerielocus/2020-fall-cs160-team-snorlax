// Attempt to find the relations in relArray using the given api and starting
// point rootPath
//
// api -- the api that fetches information from the server (i.e. client object)
// rootPath -- a path to the starting point (i.e. '/api')
// relArray -- a relationship array; a relation can be a String or a
// dictionary containing a String key 'rel', the relation and additionally,
// a key 'params' to use.
module.exports = function follow(api, rootPath, relArray) {
  // get the json object of the relation
  const root = api({
    method: 'GET',
    path: rootPath
  });

  return relArray.reduce(function(here, arrayItem) {
    const rel = typeof arrayItem === 'string' ? arrayItem : arrayItem.rel;
    return traverseNext(here, rel, arrayItem);
  }, root);

  // traverseNext :: Promise JSON -> Relation -> ArrayItem -> Promise JSON
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

  function hasEmbeddedRel (entity, rel) {
    return entity._embedded && entity._embedded.hasOwnProperty(rel);
  }
};
