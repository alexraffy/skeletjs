import {NavigationControllerDelegate} from "mentatjs";


export interface FloatingWindowDelegate extends NavigationControllerDelegate{

    floatingWindowWasClosed?(id: string, ret: any);


}