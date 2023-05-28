
## Test locally 

```` bash 

npx expo start

````





## Build for android ( local APK ) - expo project


Root level create <code>eas.json</code> ( exemple for local test apk )

```` json 

{
    "build": {
        "preview": {
        "distribution": "internal"
        }
    }
}

````

```` bash 

# expo account
 eas login

 eas build:configure

 eas build --profile preview --platform android

````

