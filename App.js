import * as SQLite from 'expo-sqlite';

import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Button, ScrollView, RefreshControlComponent, Platform } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import * as ImagePicker from 'expo-image-picker';

export default function App(){
 
  const searchImg = require('./assets/camera.png')
  
  const avatarImg = require('./assets/five.jpg')
  
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Register">
        <Stack.Screen name="ListContacts" component={ListContacts} options={{
          headerLeft: props => <Text></Text>,
          headerTitle: props => <TouchableOpacity onPress={() => {
            console.log("переходим к поиску")
            navigation.navigate("Search")
          }}>
            <Image style={{ width: 75, height: 75 }} source={ searchImg } />
          </TouchableOpacity>      
        }}/>
        <Stack.Screen name="Chat" component={Chat}  options={{
          headerTitle: props => <Image style={{ width: 45, height: 45 }}  source={ avatarImg } />
        }}/>
        <Stack.Screen name="ContactInfo" component={ContactInfo} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Search" component={Search} />
      </Stack.Navigator>
    </NavigationContainer>
  )

}

function Search({ navigation, route }) {
  
  const { myId } = route.params
  console.log(`myId: ${myId}`)
  
  const [ searchContacts, setSearchContacts ] = useState([])
  
  // const [ allContacts, setAllContacts ] = useState([
  //   {
  //     id: 1,
  //     name: 'Роман Сакутин',
  //     lastMessage: "Хэй, мен...",
  //     avatar: require('./assets/camera.png'),
  //     phone: "89167243215",
  //     photo: './assets/camera.png'
  //   },
  //   {
  //     id: 2,
  //     name: 'Арт Аласки',
  //     lastMessage: "Доброго времени уток",
  //     avatar: require('./assets/five.jpg'),
  //     phone: "89987654321",
  //     photo: './assets/five.jpg'
  //   },
  //   {
  //     id: 3,
  //     name: 'Флатинго',
  //     lastMessage: "Привет гей девелоперы",
  //     avatar: require('./assets/cross.jpg'),
  //     phone: "89123456789",
  //     photo: './assets/cross.jpg'
  //   }
  // ]) 
  const [ allContacts, setAllContacts ] = useState([]) 
  
  useEffect(() => {
    fetch(`https://messengerserv.herokuapp.com/contacts/list`, {
      mode: 'cors',
      method: 'GET'
    }).then(response => response.body).then(rb  => {
      const reader = rb.getReader()
      return new ReadableStream({
        start(controller) {
          function push() {
            reader.read().then( ({done, value}) => {
              if (done) {
                console.log('done', done);
                controller.close();
                return;
              }
              controller.enqueue(value);
              console.log(done, value);
              push();
            })
          }
          push();
        }
      });
  }).then(stream => {
      return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
    })
    .then(async result => {
      // console.log(`JSON.parse(result): ${JSON.parse(result).contacts}`)
      if(JSON.parse(result).status.includes("OK")){
        setAllContacts(JSON.parse(result).contacts)
      }
    })
  }, [])

  const [ keywords, setKeywords ] = useState("")
  
  const searchImg = require('./assets/search.png')

  function refreshSearch(searchKeywords){
    useEffect(() => {
      setSearchContacts([])
    }, [])
    allContacts.filter(contact => {
      if(contact.name.includes(searchKeywords) && !contact._id.includes(myId)){
        return true  
      }
      return false
    })
  }

  refreshSearch('')

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* <Text>&nbsp;</Text> */}
        <TextInput placeholder="Введите имя..." value={keywords} numberOfLines={4} style={{ borderColor: '#000000', borderWidth: 1, width: 750, paddingVertical: 10, backgroundColor: 'rgb(255, 255, 255)', marginTop: 15 }} onChangeText={(value) => setKeywords(value)} />
        <View style={{ width: 150 }}>
          <TouchableOpacity onPress={() => {
            // setSearchContacts([])
            setSearchContacts(
              allContacts.filter(contact => {
                console.log(`contact.name: ${contact.name}, contact._id: ${contact._id}`)
                if(contact.name.toLowerCase().includes(keywords.toLowerCase()) && !(contact._id.includes(myId))){
                  return true
                }
                return false
              })
            )
            // console.log(`searchContacts: ${searchContacts}`)
          }}>
            <Image style={{ width: 45, height: 45 }} source={ searchImg } />
          </TouchableOpacity>
        </View>
        {/* <Text>&nbsp;</Text> */}
      </View>

      <ScrollView>
        {
          searchContacts.map(searchContact => {
            return (
              <View key={ searchContact._id }>
                <View style={styles.container}>
                  <View style={{ flexDirection: 'column' }}>
                    <TouchableOpacity style={{ borderRadius: 150 }} onPress={() => {
                      navigation.navigate("ContactInfo", {
                        avatar: searchContact.avatar,
                        name: searchContact.name
                      })
                    }}>
                      <Image style={{ width: 50, height: 50 }} source={ searchContact.avatar } />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => {
                    console.log(`searchContact._id: ${searchContact._id}, myId: ${myId}`)
                    navigation.navigate("Chat", {
                      avatar: searchContact.avatar,
                      name: searchContact.name,
                      id: searchContact.id,
                      phone: searchContact.phone,
                      contactId: myId,
                      otherContactId: searchContact._id
                    })
                  }}>
                    <View style={{ flexDirection: 'column' }} onPress={() => {
                      console.log(`searchContact._id: ${searchContact._id}, myId: ${myId}`)
                      navigation.navigate("Chat", {
                        avatar: searchContact.avatar,
                        name: searchContact.name,
                        id: searchContact.id,
                        phone: searchContact.phone,
                        contactId: myId,
                        otherContactId: searchContact._id
                      })
                    }}>
                      <Text>{ searchContact.name }</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={{ padding: 4, borderBottomColor: "rgb(200, 200, 200)", borderBottomWidth: StyleSheet.hairlineWidth }}></Text>
              </View>
            )
          })
        }
      
      </ScrollView>
    
    </View>
  )
}

function ContactInfo({ route }) {
  
  const { avatar, name } = route.params
  
  // const avatar = "five"

  const photoPick = require('./assets/camera.png')  

  var photo = require('./assets/five.jpg')
  if(avatar.includes('five')){
    photo = require('./assets/five.jpg')  
  } else if(avatar.includes('cross')){
    photo = require('./assets/cross.jpg')  
  } else if(avatar.includes('camera')){
    photo = require('./assets/camera.png')  
  } else if(avatar.includes('barcode')){
    photo = require('./assets/barcode.jpg')  
  } else if(avatar.includes('magnet')){
    photo = require('./assets/magnet.jpg')  
  }
  
  const db = SQLite.openDatabase('favoritecontacts.db')

  const [ uploadedImage, setUploadedImage ] = useState(null);
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  db.transaction(transaction => {
    let sqlStatement = `SELECT * FROM contacts;`
    transaction.executeSql(sqlStatement, [], (tx, receivedContacts) => {
      setUploadedImage(Object.values(receivedContacts.rows.item(0))[3])
    }, (tx) => {
      console.log("ошибка получения аватарки")
    })
  })
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result);
    if (!result.cancelled) {
      setUploadedImage(result.uri);
  
      db.transaction(transaction => {
        let sqlStatement = `UPDATE contacts SET avatar=\"${result.uri}\" WHERE _id=1;`
        transaction.executeSql(sqlStatement, [], (tx, receivedContact) => {
        })
      })

    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
      {/* <Image style={{ width: 750, height: 500 }} source={ photo } /> */}
      { uploadedImage && <Image source={{ uri: uploadedImage }} style={{ width: 200, height: 200 }} /> }
      <TouchableOpacity onPress={() => {
        console.log("Загружаем картинку")
        pickImage()
      }}>
        <Image style={{ width: 75, height: 75 }} source={ photoPick } />
      </TouchableOpacity>
      <Text>{ name }</Text>
    </View>
  )
}

function Register({ navigation, route }) {
  
  const [ inputPhone, setInputPhone ] = useState('')

  const db = SQLite.openDatabase('favoritecontacts.db')

  db.transaction(transaction => {
    let sqlStatement = "CREATE TABLE IF NOT EXISTS contacts (_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, avatar TEXT, id TEXT);"
    transaction.executeSql(sqlStatement, [], (tx, receivedTable) => {
      sqlStatement = "SELECT * FROM contacts;"
      transaction.executeSql(sqlStatement, [], (tx, receivedContacts) => {
        
        if(receivedContacts.rows.length >= 1){
          navigation.navigate("ListContacts")
        }

      })

    })
  })

  function register(){

    let newId = "#"

    // db.transaction(transaction => {
      console.log("Зарегестрировать")
      fetch(`https://messengerserv.herokuapp.com/contacts/create?name=${inputPhone}&phone=${inputPhone}`, {
        mode: 'cors',
        method: 'GET'
      }).then(response => response.body).then(rb  => {
        const reader = rb.getReader()
        return new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then( ({done, value}) => {
                if (done) {
                  console.log('done', done);
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                console.log(done, value);
                push();
              })
            }
            push();
          }
        });
    }).then(stream => {
        return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
      })
      .then(async result => {

        if(JSON.parse(result).status.includes("OK")){
          newId = JSON.parse(result).id
          console.log(`newId: ${newId}`)
          
          let sqlStatement = `INSERT INTO \"contacts\"(name, phone, avatar, id) VALUES (\"${inputPhone}\",\"${inputPhone}\",\"empty\",\"${newId}\");`
          db.transaction(transaction => {
            transaction.executeSql(sqlStatement, [], (tx, receivedContact) => {
              navigation.navigate("ListContacts")
            }, (tx) => {
              console.log("ошибка регистрирации")    
            })
          })

        }
      })

      // let sqlStatement = `INSERT INTO \"contacts\"(name, phone, avatar, id) VALUES (\"${inputPhone}\",\"${inputPhone}\",\"empty\",\"${newId}\");`
      // transaction.executeSql(sqlStatement, null, (tx, receivedContact) => {
      //   navigation.navigate("ListContacts")
      // }, (tx) => {
      //   console.log("ошибка регистрирации")    
      // })

    // })
    
  }

  return (
    <View>
      {/* <Text>&nbsp;</Text> */}
      <TextInput value={ inputPhone } onChangeText={(value) => setInputPhone(value) } placeholder="Введите номер телефона: 7-9XX-XXX-XX-XX" style={{ borderColor: '#000000', borderWidth: 1, paddingVertical: 10, backgroundColor: 'rgb(255, 255, 255)' }} />
      {/* <Text>&nbsp;</Text> */}
      <View>
        <Button style={{  }} title={">"} onPress={() => {
          register()
        }}/>
      </View>
    </View>
  )

}

function Chat({ navigation, route }) {
  
  const { avatar, name, id, phone, contactId, otherContactId } = route.params
  // console.log(`avatar: ${avatar}`)
  
  var avatarImg = require('./assets/five.jpg')
  
  if(avatar.includes('five')){
    avatarImg = require('./assets/five.jpg')  
  } else if(avatar.includes('cross')){
    avatarImg = require('./assets/cross.jpg')  
  } else if(avatar.includes('camera')){
    avatarImg = require('./assets/camera.png')  
  } else if(avatar.includes('barcode')){
    avatarImg = require('./assets/barcode.jpg')  
  } else if(avatar.includes('magnet')){
    avatarImg = require('./assets/magnet.jpg')  
  }
  

  // const avatarImg = require(avatar)
  // const [ avatarImg, setAvatarImg ] = useState('')
  // setAvatarImg(require('./assets/five.jpg'))

  const [ inputMessage, setInputMessage ] = useState('')

  const [ messages, setMessages ] = useState([])
  // const [ messages, setMessages ] = useState([
  //   {
  //     id: 1,
  //     sender: 'Роман Сакутин',
  //     message: 'Хэй, мен...',
  //     isSender: true,
  //   },
  //   {
  //     id: 2,
  //     sender: 'Флатинго',
  //     message: 'Привет гей девелоперы',
  //     isSender: false,
  //   },
  //   {
  //     id: 3,
  //     sender: 'Роман Сакутин',
  //     message: 'Хэй, мен...',
  //     isSender: true
  //   },
  //   {
  //     id: 4,
  //     sender: 'Роман Сакутин',
  //     message: 'Хэй, мен...',
  //     isSender: false
  //   },
  //   {
  //     id: 5,
  //     sender: 'Роман Сакутин',
  //     message: 'Хэй, мен...',
  //     isSender: false,
  //   },
  //   {
  //     id: 6,
  //     sender: 'Роман Сакутин',
  //     message: 'Хэй, мен...',
  //     isSender: true
  //   }
  // ]) 
  
  const db = SQLite.openDatabase('favoritecontacts.db')
  useEffect(() => {
    db.transaction(transaction => {
      console.log("Прикрепить новый контакт к этому пользователю")
      let sqlStatement = "CREATE TABLE IF NOT EXISTS otherscontacts (_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, avatar TEXT);"
      transaction.executeSql(sqlStatement, [], (tx, receivedTable) => {
        sqlStatement = `INSERT INTO \"otherscontacts\"(name, phone, avatar) VALUES (\"${name}\",\"${phone}\",\"empty\");`
        transaction.executeSql(sqlStatement, [], (tx, receivedContact) => {
          console.log("успешно добавлено")
        
          console.log(`contactId: ${contactId}, otherContactId: ${otherContactId}`)
          fetch(`https://messengerserv.herokuapp.com/contacts/add/?contactid=${contactId}&othercontactid=${otherContactId}`, {
            mode: 'cors',
            method: 'GET'
          }).then(response => response.body).then(rb  => {
            const reader = rb.getReader()
            return new ReadableStream({
              start(controller) {
                function push() {
                  reader.read().then( ({done, value}) => {
                    if (done) {
                      console.log('done', done);
                      controller.close();
                      return;
                    }
                    controller.enqueue(value);
                    console.log(done, value);
                    push();
                  })
                }
                push();
              }
            });
          }).then(stream => {
            return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
          })
          .then(async result => {
            
          })
          
          fetch(`https://messengerserv.herokuapp.com/contacts/get/?id=${contactId}`, {
              mode: 'cors',
              method: 'GET'
            }).then(response => response.body).then(rb  => {
              const reader = rb.getReader()
              return new ReadableStream({
                start(controller) {
                  function push() {
                    reader.read().then( ({done, value}) => {
                      if (done) {
                        console.log('done', done);
                        controller.close();
                        return;
                      }
                      controller.enqueue(value);
                      console.log(done, value);
                      push();
                    })
                  }
                  push();
                }
              });
            }).then(stream => {
              return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
            })
            .then(async result => {
              setMessages(JSON.parse(result).contact.messages)
            })

        }, (tx) => {
          console.log("ошибка добавления")    
        })
      }, (tx) => {
            
      })
  
    })
  }, [])

  return (
    <View>
      <TouchableOpacity onPress={() => {
        navigation.navigate("ContactInfo", {
          avatar: avatar,
          name: name
        })
      }}>
        <Image style={{ marginBottom: 15, width: 40, height: 40 }} source={ avatarImg } />
      </TouchableOpacity>
    {
      messages.map(message => {
        return (
          message.id.includes(contactId) ?
            <View style={{ marginTop: 5, marginLeft: 5 }} key={ message.id } >
              <View style={{ alignItems: "flex-start" }}>
                <TouchableOpacity style={{ borderRadius: 3, width: 275, height: 35, backgroundColor: "rgb(175, 175, 255)" }}>
                  <Text style={{  }}>{ message.message }</Text>
                </TouchableOpacity>
              </View>
            </View>
          :
          <View style={{ marginTop: 5, marginRight: 5 }} key={ message.id } >
            <View style={{ alignItems: "flex-end" }}>
              <TouchableOpacity style={{ borderRadius: 3, width: 275, height: 35, backgroundColor: "#ccc" }}>
                <Text>{ message.message }</Text>
              </TouchableOpacity>
            </View>
          </View>
          )
      })
    }
     
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* <Text>&nbsp;</Text> */}
        <TextInput placeholder="Введите сообщение" value={inputMessage} numberOfLines={4} style={{ borderColor: '#000000', borderWidth: 1, width: 750, paddingVertical: 10, backgroundColor: 'rgb(255, 255, 255)', marginTop: 15 }} onChangeText={(value) => setInputMessage(value)} />
        <View style={{ width: 150 }}>
          <Button onPress={() => {
            if(inputMessage.length >= 1){
              console.log("Добавить сообщение")
              
              // messages.push({
              //   sender: 'Роман Сакутин',
              //   message: inputMessage,
              //   isSender: true
              // })
              messages.push({
                id: contactId,
                message: inputMessage,
                isSender: true
              })

              fetch(`https://messengerserv.herokuapp.com/contacts/messages/add/?contactid=${contactId}&othercontactid=${otherContactId}&message=${inputMessage}`, {
                mode: 'cors',
                method: 'GET'
              }).then(response => response.body).then(rb  => {
                const reader = rb.getReader()
                return new ReadableStream({
                  start(controller) {
                    function push() {
                      reader.read().then( ({done, value}) => {
                        if (done) {
                          console.log('done', done);
                          controller.close();
                          return;
                        }
                        controller.enqueue(value);
                        console.log(done, value);
                        push();
                      })
                    }
                    push();
                  }
                });
              }).then(stream => {
                return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
              })
              .then(async result => {
              })

              setInputMessage("")
              setMessages(messages)
            }
          }} title={ ">" }/>
        </View>
        {/* <Text>&nbsp;</Text> */}
      </View>
    </View>
  )
}

function ListContacts({ navigation }) {

  const [ me, setMe ] = useState({
    id: '1',
    name: '#',
    phone: '#',
    avatar: '#',
    _id: '#',
  })

  const searchImg = require('./assets/camera.png')

  const avatar = require('./assets/camera.png')
  const [ contacts, setContacts ] = useState([
    {
      id: 1,
      name: 'Роман Сакутин',
      lastMessage: "Хэй, мен...",
      avatar: require('./assets/camera.png'),
      photo: './assets/camera.png'
    },
    {
      id: 2,
      name: 'Арт Аласки',
      lastMessage: "Доброго времени уток",
      avatar: require('./assets/five.jpg'),
      photo: './assets/five.jpg'
    },
    {
      id: 3,
      name: 'Флатинго',
      lastMessage: "Привет гей девелоперы",
      avatar: require('./assets/cross.jpg'),
      photo: './assets/cross.jpg'
    }
  ])
  
  // var remoteContacts = []
  const [ remoteContacts, setRemoteContacts ] = useState([])
  const db = SQLite.openDatabase('favoritecontacts.db')
  db.transaction(transaction => {
    let sqlStatement = "CREATE TABLE IF NOT EXISTS otherscontacts (_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, avatar TEXT);"
    // let sqlStatement = "CREATE TABLE IF NOT EXISTS ? (_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, avatar TEXT);"
    // transaction.executeSql(sqlStatement, [ "otherscontacts" ], (tx, receivedTable) => {
    transaction.executeSql(sqlStatement, [  ], (tx, receivedTable) => {
      
      sqlStatement = "SELECT * FROM otherscontacts;"
      transaction.executeSql(sqlStatement, [], (tx, receivedContacts) => {
        
        let tempreceivedContacts = []
        Array.from(receivedContacts.rows).forEach((remoteContactRow, remoteContactRowIdx) => {
          
          tempreceivedContacts = [
            ...tempreceivedContacts,
            {
              id: Object.values(receivedContacts.rows.item(remoteContactRowIdx))[0],
              name: Object.values(receivedContacts.rows.item(remoteContactRowIdx))[1],
              lastMessage: "Привет",
              phone: Object.values(receivedContacts.rows.item(remoteContactRowIdx))[2],
              avatar: Object.values(receivedContacts.rows.item(remoteContactRowIdx))[3],
              photo: Object.values(receivedContacts.rows.item(remoteContactRowIdx))[3]
            }
          ]

        })

        setRemoteContacts(tempreceivedContacts)

        sqlStatement = "SELECT * FROM contacts;"
        transaction.executeSql(sqlStatement, [], (tx, mainContact) => {
          setMe({
            id: Object.values(mainContact.rows.item(0))[0],
            name: Object.values(mainContact.rows.item(0))[1],
            phone: Object.values(mainContact.rows.item(0))[2],
            avatar: Object.values(mainContact.rows.item(0))[3],
            _id: Object.values(mainContact.rows.item(0))[4]
          })
          
        })

      })
    })
  })

  return (
    <>
      {
        remoteContacts.length >= 1
        ?
          remoteContacts.map(contact => {
            return (
              <View key={ contact.id }>
                <View style={styles.container}>
                  <View style={{ flexDirection: 'column' }}>
                    <TouchableOpacity style={{ borderRadius: 150 }} onPress={() => {
                      navigation.navigate("ContactInfo", {
                        avatar: contact.avatar,
                        name: contact.name
                      })
                    }}>
                      <Image style={{ width: 50, height: 50 }} source={ contact.avatar } />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => {
                    navigation.navigate("Chat", {
                      avatar: contact.avatar,
                      name: contact.name,
                      id: contact.id,
                      phone: contact.phone,
                      contactId: myId,
                      otherContactId: contact._id
                    })
                  }}>
                    <View style={{ flexDirection: 'column' }} onPress={() => {
                      navigation.navigate("Chat", {
                        avatar: contact.avatar,
                        name: contact.name,
                        id: contact.id,
                        phone: contact.phone,
                        contactId: myId,
                        otherContactId: contact._id
                      })
                    }}>
                      <Text>{ contact.name }</Text>
                      <Text>{ contact.lastMessage }</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={{ padding: 4, borderBottomColor: "rgb(200, 200, 200)", borderBottomWidth: StyleSheet.hairlineWidth }}></Text>
              </View>
            )
          })
        :
          <View style={{ alignItems: 'center' }}>
            <Text>Контактов нет</Text>
          </View>
      }
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginRight: 15 }}>
        <View style={{ width: 75 }}>
        <TouchableOpacity onPress={() => {
          navigation.navigate("ContactInfo", {
            avatar: me.avatar,
            name: me.name
          })
        }}>
          <Image style={{ width: 50, height: 50 }} source={ avatar } />
        </TouchableOpacity>        </View>
        <View style={{ width: 75 }}>
          <Button title="+" style={{ width: 75, height: 75 }} onPress={() => {
            console.log("переходим к поиску")
            navigation.navigate("Search", {
              myId: me._id
            })
          }}/>
        </View>
      </View>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'space-between',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});
