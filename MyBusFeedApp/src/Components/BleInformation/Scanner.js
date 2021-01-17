import {BleManager, State, Device, Subscription} from 'react-native-ble-plx';

export interface Observer {
    onStarted: (started:boolean) => void;
    onStateChanged: (state: State) => void;
    onDeviceDetected: (device: Device) => void;
    onError: (error: any) => void;
}

export default () => {
    const bleManager = new BleManager();

    let subscription; Subscription | null = null;
    let observer: Observer = {
        onStarted: () => {},
        onStateChanged: () => {},
        onDeviceDetected: () => {},
        onError: () => {},
    };

    const observe = (newObserver: Observer) => (observer = newObserver);

    const start = () => {
        if (subscription) {
            try {
                subscription.remove();
            } catch (error) {
                observer.onError(error);
            }
        }
        try {
            subscription = bleManager.onStateChange((state) => {
                observer.onStateChanged(state);

                //TODO: need to change this to be trigger by page onload & without app launch
                if (state == State.PoweredOn) {
                    try {
                        // TODO: Change the null to load all the ble UUID
                        bleManager.startDeviceScan(null, null, (error, device) => {
                            if (error) {
                                observer.onError(error);
                                return;
                            }

                            if (device) {
                                observer.onDeviceDetected(device);
                            }
                        });
                    } catch (error) {
                        observer.onError(error);
                    }
                }
            }, true);
            observer.onStarted(true)
        } catch (error) {
            observer.onError(error);
            stop();
        }
    };

    const stop = () => {
        if (subscription){
            try {
                subscription.remove();
                bleManager.stopDeviceScan();
            } catch (error) {
                observer.onError(error);
            }
            subscription = null;
            observer.onStarted(false);
        }
    };

    return {
        start,
        stop,
        observe
    }
}