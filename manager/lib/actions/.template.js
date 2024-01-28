export function TEMPLATE() {
  return new Promise(async (resolve, reject) => {
    try{

      // done
      resolve();

    }catch(e){
      reject(e);
    }
  });
}