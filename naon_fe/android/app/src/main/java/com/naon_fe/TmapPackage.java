package com.naon_fe;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;

public class TmapPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
//        List<NativeModule> modules = new ArrayList<>();
//        modules.add(new TmapModule(reactContext));
//
//        return modules;
        //return Arrays.<NativeModule>asList(new TmapModule(reactContext));
        return Collections.emptyList();
    }
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        //return Collections.emptyList();

        List<ViewManager> viewManagers = new ArrayList<>();
        viewManagers.add(new TmapViewManager());

        return viewManagers;
    }
}