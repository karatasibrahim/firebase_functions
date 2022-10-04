const functions = require("firebase-functions");
const admin = require('firebase-admin');
const axios = require('axios');
admin.initializeApp();
 
// exports.addShift = functions.https.onCall((data, context) => {
//    const text=data.text;
//   const uid=context.auth.uid;
//   const email=context.auth.token.email || null;
// });
// exports.yeniShiftEkle=functions.firestore.document('/{collection}/{id}').onCreate((snap,context)=>{
// const Shiftler=admin.firestore().collection('Leaves');
// const collection=context.params.collection
// const id=context.params.id;
// if(collection==='Employees')
// {
//   return Shiftler.add({
//     text:'yeni kullanıcı eklendi', id:id
//   });
// }
// });
exports.yeniShiftEkle=functions.https.onCall((data,context)=>{
  if(!context.auth)
  {
    throw new functions.https.HttpsError('unauthenticated','Lütfen giriş yapınız'
    );
  }

  if(data.Employee.Leave!=false) // 1 izinli 0 izinli değil
{
throw new functions.https.HttpsError('invalid-argument','Eklemeye çalıştığınız personel izinli');
}

return admin.firestore().collection('Shift').add({
  CompanyUid:context.Uid,
  Client:data.ClientName,
  JobTitle:data.JobTitle,
  ShiftTime:data.ShiftTime,
  EmployeName:data.EmployeName,
  StartDate:data.StartDate,
  EndDate:data.EndDate,
  StartTime:data.StartTime,
  EndTime:data.EndTime,
  BreakTime:data.BreakTime

});

})



