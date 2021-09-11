import * as SQLite from 'expo-sqlite';

import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Button, ScrollView, RefreshControlComponent } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


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
  
  const [ searchContacts, setSearchContacts ] = useState([])

  const [ allContacts, setAllContacts ] = useState([
    {
      name: 'Роман Сакутин',
      lastMessage: "Хэй, мен...",
      avatar: require('./assets/camera.png'),
      photo: './assets/camera.png'
    },
    {
      name: 'Арт Аласки',
      lastMessage: "Доброго времени уток",
      avatar: require('./assets/five.jpg'),
      photo: './assets/five.jpg'
    },
    {
      name: 'Флатинго',
      lastMessage: "Привет гей девелоперы",
      avatar: require('./assets/cross.jpg'),
      photo: './assets/cross.jpg'
    }
  ]) 

  const [ keywords, setKeywords ] = useState("")
  
  const searchImg = require('./assets/camera.png')

  function refreshSearch(searchKeywords){
    useEffect(() => {
      setSearchContacts([])
    }, [])
      allContacts.filter(contact => {
      if(contact.name.includes(searchKeywords)){
        return true  
      }
      return false
    })
  }

  refreshSearch('')

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text>&nbsp;</Text>
        <TextInput placeholder="Введите имя..." value={keywords} numberOfLines={4} style={{ borderColor: '#000000', borderWidth: 1, width: 750, paddingVertical: 10, backgroundColor: 'rgb(255, 255, 255)', marginTop: 15 }} onChangeText={(value) => setKeywords(value)} />
        <View style={{ width: 150 }}>
          <TouchableOpacity onPress={() => {
            // setSearchContacts([])
            setSearchContacts(
              allContacts.filter(contact => {
                if(contact.name.toLowerCase().includes(keywords.toLowerCase())){
                  return true
                }
                return false
              })
            )
            console.log(`searchContacts: ${searchContacts}`)
          }}>
            <Image style={{ width: 45, height: 45 }} source={ searchImg } />
          </TouchableOpacity>
        </View>
        <Text>&nbsp;</Text>
      </View>

      <ScrollView>
        {
          searchContacts.map(searchContact => {
            return (
              <View key={ searchContact.name }>
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
                    navigation.navigate("Chat", {
                      avatar: searchContact.avatar,
                      name: searchContact.name
                    })
                  }}>
                    <View style={{ flexDirection: 'column' }} onPress={() => {
                      navigation.navigate("Chat", {
                        avatar: searchContact.avatar,
                        name: searchContact.name
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
  

  
  return (
    <View style={{ alignItems: 'center' }}>
      <Image style={{ width: 750, height: 500 }} source={ photo } />
      <Text>{ name }</Text>
    </View>
  )
}

function Register({ navigation, route }) {
  
  const [ inputPhone, setInputPhone ] = useState('')

  const db = SQLite.openDatabase('smartcardspickerdb.db')

  db.transaction(transaction => {
    let sqlStatement = "CREATE TABLE IF NOT EXISTS contacts (_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, avatar TEXT);"
    transaction.executeSql(sqlStatement, null, (tx, receivedTable) => {
      sqlStatement = "SELECT * FROM contacts;"
      transaction.executeSql(sqlStatement, null, (tx, receivedContacts) => {
        
        if(receivedContacts.rows.length >= 1){
          navigation.navigate("ListContacts")
        }

      })

    })
  })

  function register(){

    db.transaction(transaction => {
      console.log("Зарегестрировать")
      let sqlStatement = `INSERT INTO \"contacts\"(name, phone, avatar) VALUES (\"${inputPhone}\",\"${inputPhone}\",\"empty\");`
      transaction.executeSql(sqlStatement, null, (tx, receivedContact) => {
        navigation.navigate("ListContacts")
      }, (tx) => {
        console.log("ошибка регестрирации")    
      })

    })
    
  }

  return (
    <View>
      <Text>&nbsp;</Text>
      <TextInput value={ inputPhone } onChangeText={(value) => setInputPhone(value) } placeholder="Введите номер телефона: 7-9XX-XXX-XX-XX" style={{ borderColor: '#000000', borderWidth: 1, paddingVertical: 10, backgroundColor: 'rgb(255, 255, 255)' }} />
      <Text>&nbsp;</Text>
      <View>
        <Button style={{  }} title={">"} onPress={() => {
          register()
        }}/>
      </View>
    </View>
  )

}

function Chat({ navigation, route }) {
  
  const { avatar, name } = route.params
  console.log(`avatar: ${avatar}`)
  
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

  const [ messages, setMessages ] = useState([
    {
      id: 1,
      sender: 'Роман Сакутин',
      message: 'Хэй, мен...',
      isSender: true,
    },
    {
      id: 2,
      sender: 'Флатинго',
      message: 'Привет гей девелоперы',
      isSender: false,
    },
    {
      id: 3,
      sender: 'Роман Сакутин',
      message: 'Хэй, мен...',
      isSender: true
    },
    {
      id: 4,
      sender: 'Роман Сакутин',
      message: 'Хэй, мен...',
      isSender: false
    },
    {
      id: 5,
      sender: 'Роман Сакутин',
      message: 'Хэй, мен...',
      isSender: false,
    },
    {
      id: 6,
      sender: 'Роман Сакутин',
      message: 'Хэй, мен...',
      isSender: true
    }
  ]) 
  
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
          message.isSender ?
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
        <Text>&nbsp;</Text>
        <TextInput placeholder="Введите сообщение" value={inputMessage} numberOfLines={4} style={{ borderColor: '#000000', borderWidth: 1, width: 750, paddingVertical: 10, backgroundColor: 'rgb(255, 255, 255)', marginTop: 15 }} onChangeText={(value) => setInputMessage(value)} />
        <View style={{ width: 150 }}>
          <Button onPress={() => {
            if(inputMessage.length >= 1){
              console.log("Добавить сообщение")
              messages.push({
                sender: 'Роман Сакутин',
                message: inputMessage,
                isSender: true
              })
              setInputMessage("")
              setMessages(messages)
            }
          }} title={ ">" }/>
        </View>
        <Text>&nbsp;</Text>
      </View>
    </View>
  )
}

function ListContacts({ navigation }) {
  
  const searchImg = require('./assets/camera.png')

  const avatar = require('./assets/camera.png')
  const [ contacts, setContacts ] = useState([
    {
      name: 'Роман Сакутин',
      lastMessage: "Хэй, мен...",
      avatar: require('./assets/camera.png'),
      photo: './assets/camera.png'
    },
    {
      name: 'Арт Аласки',
      lastMessage: "Доброго времени уток",
      avatar: require('./assets/five.jpg'),
      photo: './assets/five.jpg'
    },
    {
      name: 'Флатинго',
      lastMessage: "Привет гей девелоперы",
      avatar: require('./assets/cross.jpg'),
      photo: './assets/cross.jpg'
    }
  ]) 

  return (
    <View>
      {
        contacts.map(contact => {
          return (
          <View key={ contact.name }>
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
                  name: contact.name
                })
              }}>
                <View style={{ flexDirection: 'column' }} onPress={() => {
                  navigation.navigate("Chat", {
                    avatar: contact.avatar,
                    name: contact.name
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
      }
      <View style={{ alignItems: 'flex-end', marginTop: 15, marginRight: 15 }}>
        <View style={{ width: 75 }}>
          <Button title="+" style={{ width: 75, height: 75 }} onPress={() => {
            console.log("переходим к поиску")
            navigation.navigate("Search")
          }}/>
        </View>
      </View>
    </View>
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
