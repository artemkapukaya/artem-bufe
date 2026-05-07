// server/middleware.ts
export const chefNoteMiddleware = (req, res, next) => {
  const customerName = req.body.customerName; 
  
  if (customerName === "Ergin Kapukaya") {
    console.log("DİKKAT ŞEFİM: Ergin Bey pirzolayı çok pişmiş ve bol acılı sever!");
  }
  next();
};