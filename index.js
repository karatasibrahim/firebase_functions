const functions = require('firebase-functions');
const admin=require('firebase-admin');
admin.initializeApp();

// Firebase de authentication işlemi gerçekleştiğinde firestore Database veritabanında 'Kullanicilar' 
//adında bir tabloya yeni authenticate olan kullanıcının bilgilerini yazdırıyoruz.
//Yeni kullanıcı ekleme fonksiyonu
exports.newUserAdd=functions.auth.user().onCreate(k=>{ 

    return admin.firestore().collection('Kullanicilar').doc(k.uid).set({
        KullaniciUid:k.uid,
        Mail:k.email,
       
    });
    
});
//Kullanıcılar tablosunda ki ilgili kullanıcının tablodan silinmesi işlemi
exports.deleteUser=functions.auth.user().onDelete(k=>{

   const doc=admin.firestore().collection('Kullanicilar').doc(k.uid);
   return doc.delete();
    
});
//Yeni şube ekleme işlemi
exports.addNewBranch=functions.https.onCall((data,context)=>{
// auth kontrolu yapıyoruz
    if(!context.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Sadece giriş yapan kullanıcılar veri ekleyebilir'
        );
    }
// Şube adının uzunluk kontrolunu yapıyoruz.
    if(data.branchName.length<3){
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Lütfen 3 harften fazla karakter giriniz'
        );
    }
// Branches tablosuna ilgili bilgileri gönderiyoruz
    return admin.firestore().collection('Branches').add({

        BranchName:data.branchName,
        CreatedDate: data.createdDate
       
    });
});

//Şube puanlama
exports.branchPoints=functions.https.onCall((data,context)=>{

    if(!context.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Sadece giriş yapan kullanıcılar puanlama yapabilir'
        );
    }

    const sysUsers=admin.firestore().collection('Kullanicilar').doc(context.auth.uid);
    const sysBranches=admin.firestore().collection('Branches').doc(data.id);

    return sysUsers.get().then(doc=>{

        if(doc.data().RatedBranches.includes(data.id)){
            throw new functions.https.HttpsError(
                'failed-precondition',
                '1 Kullanıcı sadece 1 kez şube puanlaması yapabilir'
            );
        }

        return sysUsers.update({
            RatedBranches:[...doc.data().RatedBranches,data.id]
        }).then(()=>{
            return Branches.update({
                Points:admin.firestore.FieldValue.increment(1)
            });
        });
    });

    

});

// log kayıtlarını tuttuğumuz fonksiyon
exports.logRecords=functions.firestore.document('/{collection}/{id}').onCreate((snap,context)=>{

    const loglar=admin.firestore().collection('LogRecords');
    const collection=context.params.collection
    const id=context.params.id;

    if(collection==='Kullanicilar'){
        return loglar.add({
            text:'Yeni kullanıcı eklendi',
            id:id,
            tarih:Date.now()
        });
    }

    if(collection==='Branches'){
        return loglar.add({
            text:'Yeni şube eklendi',
            id:id,
            tarih:Date.now()
        });
    }
    return null;
});