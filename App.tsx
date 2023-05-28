import firebase from "firebase/compat";
import { NativeBaseProvider, extendTheme, Center, Box, HStack, Text, View, FormControl, Stack, Input, Container, Button, Icon, Modal, WarningOutlineIcon, Spinner, useToast, Card, ScrollView } from "native-base";
import React, { useEffect, useReducer, useState } from "react";
import { firebaseConfig } from "./firebase/firebase";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity } from "react-native";

const newColorTheme = {
  brand: {
    900: "#8287af",
    800: "#7c83db",
    700: "#b3bef6",
  }
};
const customTheme = extendTheme({ colors: newColorTheme });



const getCurrentPriceWorth = async (symbol:string) => {
  const resp = await fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`);
  const data = await resp.json();
  const priceOfStock = data.quoteSummary.result[0].price.regularMarketPrice.raw;
  return priceOfStock;
}




export default function App() {




  const addCurrentStockWorth = async ( querySnapshot:any ) => {

    let investments = [...querySnapshot.docs.map( (doc:any) => doc.data())];
  
    const updatedList = [...investments]; // Create a copy of the array
    for (let i = 0; i < updatedList.length; i++) {
      const stock = updatedList[i];
      const resp = await fetch(stock.urlTrackDetail);
      const data = await resp.json();
      const currentPriceOfStock = data.quoteSummary.result[0].price.regularMarketPrice.raw;
      const percentChange = data.quoteSummary.result[0].price.regularMarketChange.fmt;
    
      updatedList[i] = { ...stock, currentPriceOfStock, percentChange }; // Update the desired element
    }
  
    setListInvestments(updatedList); // Set the state with the updated copy
  }
  

  const toast = useToast();

  const [showModal, setShowModal] = useState(false);
  const [isInvalidForm, setIsInvalidForm] = useState(false);

  const [showModalInvest, setShowModalInvest] = useState(false);

  const [showModalHarvest, setShowModalHarvest] = useState(false);


  const [justSubmited, setJustSubmited] = useState<undefined|boolean>(undefined);

  const [stockTarget, setStockTarget] = useState('');

  const [showModalDelete, setShowModalDelete] = useState(false);

  // modal form
  const [stockName, setStockName] = useState('');
  const [toInvest, setToInvest] = useState('');

  const [deleteStockName, setDeleteStockName] = useState('');

  const [harvested, setHarvested] = useState(0);


  // investments
  const [listInvestments, setListInvestments] = useState<any[]>([]);


  const deleteStock = async ( investElement:any ) => {
    setDeleteStockName(investElement.stockName);
    setShowModalDelete(true);

  }

  const addInvestStock = (ev:any, investElement:any) => {
    setShowModalInvest(true)
    setStockTarget(investElement.stockName)
  }

  
  const harvestStock = (ev:any, investElement:any) => {
    setShowModalHarvest(true)
    setStockTarget(investElement.stockName)
  }

  const addStock = (ev:any) => {
    setShowModal(true);
  }

  const handleSubmit = async (ev:any, action:"add_stock"|"add_invest"|"delete_stock"|"harvest_stock") => {
    

    if ( action === "add_stock" ) {
      if ( toInvest === "" || stockName === "" ) {
        setIsInvalidForm(true);
        return;
      }
    }

    if ( action === "add_invest" ) {
      if ( toInvest === "") {
        setIsInvalidForm(true);
        return;
      }
    }

    if ( action === "harvest_stock" ) {
      if ( toInvest === "") {
        setIsInvalidForm(true);
        return;
      }
    }

    if ( isInvalidForm ) {
      return;
    }

    setJustSubmited(true);



    if ( action === "add_invest" ) { 
    
      try {


        const docRef = firebase.firestore().collection("investments").doc(stockTarget);
        docRef.get().then( (doc:any) => console.log(doc.data()) );

        let doc = await docRef.get();
        await docRef.update({
          "investAmount" : toInvest,
          "sharesAmount" : parseFloat(toInvest) / parseFloat(doc.data()!.priceOfStock)
        });


        setTimeout( async () => {
  
          setStockTarget("")
          setToInvest("");

          setShowModalInvest(false);
          setJustSubmited(undefined);
  
          const querySnapshot = await firebase.firestore().collection("investments").get();
          await addCurrentStockWorth(querySnapshot);

        }, 1500);


      } catch ( error ) {

        setStockTarget("")
        toast.show({
          title: "Error",
          description: "Error while adding stock : " + error
        });
      }
    
    } else if ( action === "add_stock" ) {

      try {
        const symbol = stockName.toUpperCase();
  
        console.log(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`)
        const priceOfStock = await getCurrentPriceWorth(symbol);
  
        await firebase.firestore()
        .collection("investments")
        .doc(symbol)
        .set({
          priceOfStock, // when bought
          stockName: symbol,
          investAmount: toInvest,
          urlTrackDetail: `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`,
          createdAt: new Date().toISOString(),
          sharesAmount: parseFloat(toInvest) / parseFloat(priceOfStock)
        });
  
        setTimeout( async () => {
  
          setStockName("");
          setToInvest("");
  
          setShowModal(false);
          setJustSubmited(undefined);
  
          const querySnapshot = await firebase.firestore().collection("investments").get();
          await addCurrentStockWorth(querySnapshot)
        }, 1500);
  
      } catch ( error ) {
        toast.show({
          title: "Error",
          description: "Error while adding stock : " + error
        });
  
      }

    } else if ( action === "delete_stock" ) {
      
      try {
        await firebase.firestore().collection("investments").doc(deleteStockName).delete();
        const querySnapshot = await firebase.firestore().collection("investments").get();
        setDeleteStockName("")
        setShowModalDelete(false)

        addCurrentStockWorth(querySnapshot);
  
      } catch ( e ) {
        setDeleteStockName("")
        setShowModalDelete(false)
        toast.show({
          title: "Error",
          description: "Error while deleting stock : " + e
        });
      }
    
    } else if ( action === "harvest_stock" ) {
      let amountShareSold = toInvest;

      try {
        const docRef = firebase.firestore().collection("investments").doc(stockTarget);
        docRef.get().then( (doc:any) => console.log(doc.data()) );

        let doc = await docRef.get();

        const newSharesAmount = parseFloat(doc.data()!.sharesAmount) - parseFloat(amountShareSold)

        if ( newSharesAmount < 0 ) {
          setIsInvalidForm(true);
          return 
        }

        await docRef.update({
          "sharesAmount" : parseFloat(newSharesAmount.toFixed(2))
        });


        setTimeout( async () => {
  
          setStockTarget("")
          setToInvest("");

          setShowModalHarvest(false);
          setJustSubmited(undefined);

          const symbol = stockTarget.toUpperCase(); 
          console.log(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`)
          const priceOfStock = await getCurrentPriceWorth(symbol);

          let harvested =  parseFloat(amountShareSold) * priceOfStock
          await firebase.firestore().collection("harvester").doc("harvester").set(
            {
              "harvested" : harvested
            }
          );
          

          const querySnapshot = await firebase.firestore().collection("investments").get();
          await addCurrentStockWorth(querySnapshot);



          setHarvested(harvested);

        }, 1500);


      } catch ( error ) {

        setStockTarget("")
        toast.show({
          title: "Error",
          description: "Error while adding stock : " + error
        });
      }
      
    } else {
      console.log("not supported operation " + action);
    }





  }

  const getFormValue = (ev:any, field:"toInvest" | "stockName") => {

    setJustSubmited(false);

    if ( field === "toInvest" ) {
      if ( isNaN(ev.nativeEvent.text) ) {
        setIsInvalidForm(true);
      } else {
        setIsInvalidForm(false);
      }
      setToInvest(ev.nativeEvent.text);
    }

    if ( field === "stockName" ) {
      setStockName(ev.nativeEvent.text);
    }
  }
  

  
  useEffect (() => {
    firebase.initializeApp(firebaseConfig);

    const fetchData = async () => {
      try {

        const harversterQueryResult = await firebase.firestore().collection("harvester").get();
        if ( harversterQueryResult.size === 0 ) {
          await firebase.firestore().collection("harvester").doc("harvester").set({"harvested" : 0});
          setHarvested(0);
        } else {
          setHarvested(harversterQueryResult.docs[0].data().harvested);
        }
        const querySnapshot = await firebase.firestore().collection("investments").get();
        addCurrentStockWorth(querySnapshot)


      } catch ( e ) {

        toast.show({
          title: "Error",
          description: "Error while fetching data : " + e
        });
      }
    }

    fetchData();
  }, []);

  return (
    <NativeBaseProvider theme={customTheme}>

      {/* <View style={styles.container}> */}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.CloseButton style={{marginTop:120}}/>
        <Modal.Content maxWidth="900px">
          <Modal.Header >Stock</Modal.Header>
          <Modal.Body>
            <FormControl isInvalid={isInvalidForm}>
              <Box>
                <Input variant="outline" placeholder="Stock name ( Symbol ) " style={{fontSize:16}} value={stockName}
                onChange={(e:any) => getFormValue(e, "stockName")}/>
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  Must be valid name
                </FormControl.ErrorMessage>
              </Box>
              <Box style={{marginTop:15}}>
                <Input variant="outline" placeholder="To invest" style={{fontSize:16}} value={toInvest}
                onChange={(e:any) => getFormValue(e, "toInvest")}/>
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  Must be valid price
                </FormControl.ErrorMessage>
              </Box>
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <Box bg={"purple.300"} flex={1}>
              <Button onPress={ e => { handleSubmit(e,'add_stock') } } isDisabled={isInvalidForm || justSubmited}>
                {
                  justSubmited ? <Spinner></Spinner> : <Text color={"white"}>Confirm</Text>
                }
              </Button>
            </Box>
          </Modal.Footer>
        </Modal.Content>
      </Modal>


      <Modal isOpen={showModalInvest} onClose={() => setShowModalInvest(false)}>
        <Modal.CloseButton style={{marginTop:120}}/>
        <Modal.Content maxWidth="900px">
          <Modal.Header >Stock</Modal.Header>
          <Modal.Body>
            <FormControl isInvalid={isInvalidForm}>
              <Box style={{marginTop:15}}>
                <Input variant="outline" placeholder="Amount" style={{fontSize:16}} value={toInvest}
                onChange={(e:any) => getFormValue(e, "toInvest")}/>
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  Must be valid price
                </FormControl.ErrorMessage>
              </Box>
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <Box bg={"purple.300"} flex={1}>
              <Button onPress={e => { handleSubmit(e,"add_invest")}} isDisabled={isInvalidForm || justSubmited}>
                {
                  justSubmited ? <Spinner></Spinner> : <Text color={"white"}>Confirm</Text>
                }
              </Button>
            </Box>
          </Modal.Footer>
        </Modal.Content>
      </Modal>


      <Modal isOpen={showModalDelete} onClose={() => {
        setDeleteStockName("")
        setShowModalDelete(false)
        }}>
        <Modal.CloseButton style={{marginTop:120}}/>
        <Modal.Content maxWidth="900px">
          <Modal.Header>Delete Stock</Modal.Header>
          <Modal.Footer>
            <Box bg={"purple.300"} flex={1}>
              <Button onPress={e => { handleSubmit(e,"delete_stock")}}>
                {
                 <Text color={"white"}>Confirm</Text>
                }
              </Button>
            </Box>
          </Modal.Footer>
        </Modal.Content>
      </Modal>


      {/* <Modal isOpen={showModalHarvest} onClose={() => { */}
      <Modal isOpen={showModalHarvest} onClose={() => {
        setDeleteStockName("")
        setShowModalHarvest(false)
        }}>
        <Modal.CloseButton style={{marginTop:120}}/>
        <Modal.Content maxWidth="900px">
          <Modal.Header>Harvest Stock</Modal.Header>
          <Modal.Body>
            <FormControl isInvalid={isInvalidForm}>
              <Box style={{marginTop:15}}>
                <Input variant="outline" placeholder="Shares sold" style={{fontSize:16}} value={toInvest}
                onChange={(e:any) => getFormValue(e, "toInvest")}/>
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  Must be valid price
                </FormControl.ErrorMessage>
              </Box>
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <Box bg={"purple.300"} flex={1}>
              <Button onPress={e => { handleSubmit(e,"harvest_stock")}} isDisabled={isInvalidForm || justSubmited}>
                {
                  justSubmited ? <Spinner></Spinner> : <Text color={"white"}>Confirm</Text>
                }
              </Button>
            </Box>
          </Modal.Footer>
        </Modal.Content>
      </Modal>


      


      <View style={{marginTop: 30}}>


      <LinearGradient colors={['#8EC5FC', '#E0C3FC', '#FF8EF7']}>
        <Box style={{ padding: 20 }}>
            <Center>
              <Text fontSize="4xl" style={{fontWeight:"bold", color:"#fff"}}>STOCK TRACKER</Text>
            </Center>
        </Box>
      </LinearGradient>
      
      <Box mt={4} mb={4}>
        <Text fontSize={16} p={4} fontWeight={"bold"}>Harvested : {harvested.toLocaleString("fr-FR", { style: "currency", currency: "USD" })} USD</Text>
      </Box>

      <Box style={{display:"flex", justifyContent: "center", marginTop: 20}}>
        <Button style={{"marginRight": 80, marginLeft: 80}} variant="outline" onPress={addStock} colorScheme="primary">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon as={Ionicons} name="add" color={"blue.900"} size={6}/>
            <Text style={{ fontSize: 16, color: '#3461eb', fontWeight: 'bold', marginLeft: 3 }}>
              STOCK
            </Text>
          </View>
        </Button>
      </Box>
      </View>


    {
      listInvestments.length === 0 ? <Box marginTop={10}>
        <Text textAlign="center" fontSize={"2xl"} style={{fontWeight: "bold"}}>No stock trackers for the moment ...</Text></Box> : 
        <ScrollView style={{marginTop: 25}}>
          {
            listInvestments.map((investElement, index:number) => (

                  <Box key={"b1" + index} marginLeft={2} marginRight={2} marginBottom={2} padding={1}>
                    <LinearGradient key={"view" + index} colors={['#A76CF9', '#D196FF', '#FF8EF7']} start={{ x: 0.3, y: 0.3 }} end={{ x: 0.6, y: 1 }}  style={{borderRadius:10,  elevation: 7, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84}}>
                        {
                          investElement.createdAt && Date.now() <= new Date(new Date(investElement.createdAt).getTime() + 1 *24*60*60*1000).getTime() &&
                          <Box>
                            <Text>
                              Waiting 1 day to update
                            </Text>
                          </Box>
                        }
                      <Box p={5} key={"b3"+index} > 
                        

                        <View style={{ flexDirection: "row", justifyContent:"center", backgroundColor:"black", padding: 15, borderRadius: 10, borderColor: 'purple', borderWidth: 2  }} mb={5}>
                          <Text style={{fontSize: 20, fontWeight: "bold"}}  color={"white"} key={"text1"+index} mr={5}>{investElement.stockName}</Text>
                          <Text key={"text5"+index} style={{fontSize: 20, fontWeight: "bold"}} color={"white"} > 
                              {investElement.percentChange && investElement.percentChange.includes("-") ?
                              `📉-${investElement.percentChange}%` :
                              `📈+${investElement.percentChange}%`}
                          </Text>
                        </View>

                        <View style={{ backgroundColor:"black", padding: 15, borderRadius: 10, borderColor: 'purple', borderWidth: 2  }} mb={5}>

                          <Box mb={5}>
                            <Text color={"white"} style={{fontSize: 20, fontWeight: "bold"}}>
                              Current
                            </Text>
                          </Box>

                          <View p={3}>
                            <Box style={{flexDirection: "row",  justifyContent:"space-between"}} mt={3}>
                            <Text style={{fontSize: 20, fontWeight: "bold"}}  color={"white"} key={"c"+index} >
                                Worth
                              </Text>
                              <Text  style={{fontSize: 20, fontWeight: "bold"}} color={"white"} key={"textxd"+index}>
                                {
                                  investElement.currentPriceOfStock &&
                                  (investElement.currentPriceOfStock).toLocaleString("fr-FR", { style: "currency", currency: "USD" })
                                }
                              </Text>
                            </Box>
                            <Box style={{flexDirection: "row",  justifyContent:"space-between"}} mt={3}>
                              <Text style={{fontSize: 20, fontWeight: "bold"}}  color={"white"} key={"c"+index} mr={5}>
                                Shares
                              </Text>
                              <Text style={{fontSize: 20, fontWeight: "bold"}}  color={"white"} key={"kle"+index} mr={5}>
                                {investElement.sharesAmount.toFixed(2)} {investElement.stockName}
                              </Text>
                            </Box>
                          </View>

                        </View>


                        <View style={{ backgroundColor:"black", padding: 15, borderRadius: 10, borderColor: 'purple', borderWidth: 2  }} mb={5}>

                          <Box mb={5}>
                            <Text color={"white"} style={{fontSize: 20, fontWeight: "bold"}}>
                              History
                            </Text>
                          </Box>

                          <View p={3}>
                            <Box style={{flexDirection: "row", justifyContent:"space-between"}}>
                              <Text style={{fontSize: 20, fontWeight: "bold"}}  color={"white"} key={"x"+index} mr={5}>
                                Invest at
                              </Text>
                              
                              <Text style={{fontSize: 20, fontWeight: "bold"}}  color={"white"} key={"d"+index} mr={5}>
                                {(investElement.priceOfStock).toLocaleString("fr-FR", { style: "currency", currency: "USD" })}
                              </Text>
                            </Box>
                            <Box style={{flexDirection: "row",  justifyContent:"space-between"}} mt={3}>
                              <Text style={{fontSize: 20, fontWeight: "bold"}}  color={"white"} key={"a"+index} mr={5}>
                                Injected
                              </Text>
                              <Text style={{fontSize: 20, fontWeight: "bold"}}  color={"white"} key={"b"+index} mr={5}>
                                {(investElement.investAmount).toLocaleString("fr-FR", { style: "currency", currency: "USD" }) + " USD"}
                              </Text>
                            </Box>
                            <Box style={{flexDirection: "row",  justifyContent:"space-between"}} mt={3}>
                              <Text style={{fontSize: 20, fontWeight: "bold"}}  color={"white"} key={"c"+index} mr={5}>
                                Shares
                              </Text>
                              <Text style={{fontSize: 20, fontWeight: "bold"}}  color={"white"} key={"kle"+index} mr={5}>
                                {investElement.sharesAmount.toFixed(2)} {investElement.stockName}
                              </Text>
                            </Box>
                          </View>

                        </View>

                      </Box>
                      
                      
                      <View style={{ flexDirection: 'row' }}>
                        <View style={{flex: 1}}>
                          <Button style={{backgroundColor:"#3c005a"}} onPress={ e => deleteStock(investElement)} m={0.5}>Delete</Button>
                        </View>
                        <View style={{flex: 1}}>
                          <Button onPress={e => { addInvestStock(e, investElement)} } m={0.5}>Invest</Button>
                        </View>
                        <View style={{flex: 1}}>
                          <Button onPress={ e => { harvestStock(e,investElement) }} m={0.5}>Harvest</Button>
                        </View>
                      </View>


                    </LinearGradient>
                  </Box>

            ))
          }
        </ScrollView>
    }



    </NativeBaseProvider>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
