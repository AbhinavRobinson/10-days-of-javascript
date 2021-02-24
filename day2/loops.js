function vowelsAndConsonants(s) {
    let leftOver = [];
    
    [...s].forEach((i)=>{
        ['a','e','i','o','u'].includes(i) ? console.log(i) :leftOver.push(i)
        });
        
    [...leftOver].forEach((i)=>console.log(i));
}
