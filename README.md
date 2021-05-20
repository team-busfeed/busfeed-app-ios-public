# MyBusFeed Mobile app

## Instructions

### First install

1. Always work on **development** branch
2. Push to branch, create a pull request to merge to **staging**
3. Once testing is done on **staging**, move to **main**

## React-Native for absolute beginners (TL;DR)

> Presentational components are small components that are concerned with how things look. Containers usually define whole application screens and are concerned with how things work: they include presentational components and wire everything together.

### Containers

> A.K.A. "application screens"

Containers are like pages, and you can include Components in Containers to form a page. 

Whatever you will reuse, put into Components, and how you display it, will be in Containers.

### Containers

Something you'd want to modularise. For example, a tab bar across all screens.

### Config

Ideally where you can store your global variables.

## Running dev environment

**Run instructions for iOS:**
- cd "/MyBusFeedApp" && npx react-native run-ios

**OR**

- Open MyBusFeedApp/ios/MyBusFeedApp.xcworkspace in Xcode or run "xed -b ios"
- Hit the Run button

**Run instructions for Android:**
- Have an Android emulator running (quickest way to get started), or a device connected.
- cd "/MyBusFeedApp" && npx react-native run-android

**Run instructions for Windows and macOS:**
- See https://aka.ms/ReactNative for the latest up-to-date instructions.


## Support us!

Help support our cloud costs:
https://www.buymeacoffee.com/teambusfeed

![Buy Me A Coffee](https://img.buymeacoffee.com/api/?url=aHR0cHM6Ly9pbWcuYnV5bWVhY29mZmVlLmNvbS9hcGkvP25hbWU9dGVhbWJ1c2ZlZWQmc2l6ZT0zMDAmYmctaW1hZ2U9Ym1jJmJhY2tncm91bmQ9NUY3RkZG&creator=teambusfeed&design_code=1&design_color=%235F7FFF&slug=teambusfeed)
