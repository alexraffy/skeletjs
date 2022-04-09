import {Btn, CollectionView, Drp, PXBounds, View} from "mentatjs";



export class ColorBookPane extends View {


    drp: Drp;
    showSwatch: Btn;
    collection: CollectionView;


    pxBoundsForView(parentBounds: PXBounds): PXBounds {
        return {
            x: 0,
            y: 0,
            width: 210,
            height: 206,
            unit: "px",
            position: "absolute"
        };
    }

    viewWasAttached(): void {
        let drp = new Drp();
        drp.pxBoundsForView = function (parentBounds): PXBounds {
            return {
                x: 5,
                y: 5,
                width: parentBounds.width - 40,
                height: 20,
                unit: 'px'
            };
        }

        drp.initView("drpBook");
        this.attach(drp);
        this.drp = drp;

        let showSwatch = new Btn();
        showSwatch.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": parentBounds.width - 30,
                "y": 5,
                "width": 20,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        showSwatch.text = '&#xf5c3;';
        showSwatch.visible = true;
        showSwatch.isToggle = true;
        showSwatch.isEnabled = true;
        showSwatch.buttonGroup = '';
        showSwatch.isToggled = false;
        showSwatch.fontFamily = 'FontAwesome5ProSolid';
        showSwatch.fontWeight = '400';
        showSwatch.fontSize = 14;
        showSwatch.fontColor = 'rgb(50,50,50)';
        showSwatch.textAlignment = 'center';
        showSwatch.initView("showSwatch");
        this.attach(showSwatch);
        this.showSwatch = showSwatch;


        let collection = new CollectionView();
        collection.pxBoundsForView = function (parentBounds): PXBounds {
            return {
                x: 5,
                y: 30,
                width: parentBounds.width - 10,
                height: parentBounds.height - 35,
                unit: 'px'
            };
        };
        collection.initView("collectionViewColorBook");
        this.attach(collection);
        this.collection = collection;


    }

}

