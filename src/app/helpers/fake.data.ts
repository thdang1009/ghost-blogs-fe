export const ExampleCode = `// Type your own code and press RUN or CMD + S to execute
function longestSlideDown(pyramid) {
    let max = -Infinity;
    for (let i = pyramid.length - 2; i >= 0; --i) {
      for (let j = 0, length = pyramid[i].length; j < length; j++) {
        const maxLeft = pyramid[i][j] + pyramid[i + 1][j];
        const maxRight = pyramid[i][j] + pyramid[i + 1][j + 1];
        max = Math.max(maxLeft, maxRight);
        pyramid[i][j] = max;
      }
    }
    return max;
  }
  const result = longestSlideDown(
    [[3],
    [7, 4],
    [2, 4, 6],
    [8, 5, 9, 3]]);
  console.log(result);`;
export const ExampleJSON = `{ "products": [{ "name": "car", "product": [{ "name": "honda", "model": [{ "id": "civic", "name": "civic" }, { "id": "accord", "name": "accord" }, { "id": "crv", "name": "crv" }, { "id": "pilot", "name": "pilot" }, { "id": "odyssey", "name": "odyssey" }] }] }] }`
export const ExampleJSON2 = `[{
  "first_name": "david",
  "gender": "Female",
  "last_name": "john",
  "password": "asdasd",
  "status": 1,
  "user_id": 1,
  "username": "rogers63"
}, {
  "first_name": "rogers",
  "gender": "Male",
  "last_name": "paul",
  "password": "qweqwe",
  "status": 1,
  "user_id": 2,
  "username": "mike28"
}]`;

export const ExampleText = `123456789`;
export const ExampleText2 = `123457890`;
