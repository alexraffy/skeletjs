import {
    Border,
    BorderRadius, BorderSide,
    Color,
    Fill, kViewProperties, NumberWithUnit,
    PropertyTextStyle,
    px,
    safeCopy,
    setProps,
    Shadow,
    ViewStyle
} from "mentatjs";
import {GUITheme} from "./GUITheme";



export class GUIThemeDark implements GUITheme {
    kind: "GUITheme";

    // BASE

    get systemFont(): string {
        return "'-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen-Sans,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif'";
    }

    // colors
    get textColor(): string {
        return "rgba(187, 187, 187, 1.0)";
    }
    get panelBackgroundColor(): string {
        return "rgba(84, 84, 84, 1.0)";
        //return "rgba(58, 58, 58, 1.0)";
        //return "rgba(38, 54, 67, 1.0)";
        //return "rgba(51, 51, 51, 1.0)";
    }
    get listBackgroundColor(): string {
        return "rgba(58, 58, 58, 1.0)";
    }
    get listRowNormalColor(): string {
        return "rgba(60, 60, 60, 1.0)";
    }
    get listRowSelectedColor(): string {
        return "rgba(82, 82, 82, 1.0)"
    }

    get tabBackgroundColor(): string {
        // return "rgba(61, 80, 95, 1.0)"; // ol'bluey
        return "rgba(72, 72, 72, 1.0)"; // Logic
    }
    get tabDarkerBackgroundColor(): string {
        return "rgba(44, 44, 44, 1.0)";
    }


    get DEPRECtitleBarBackgroundColor(): string {
        return "linear-gradient(to bottom, rgba(44, 44, 44, 1), rgba(44, 44, 44, 1.0))";
    }

    get titleBarBackgroundColor_lightGrey(): string {
        return "linear-gradient(to bottom, rgba(164, 164, 164, 1.0), rgba(164, 164, 164, 1.0))";
    }

    get panelBarStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(), {
                fills: [
                    new Fill(true, "color", "normal", "rgba(61, 80, 95, 1.0)")
                ],
                userSelect: "none"
            } as ViewStyle)
        ];
    }

    get titleBarStyle(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                fills: [new Fill(true, "gradient", "normal", "rgba(40, 40, 64, 1.0)")],
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "active",
                fills: [new Fill(true, "color", "normal", "rgba(64, 64, 64, 1.0)")],
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(10),
                    color: new Fill(true, "color", "normal", "rgba(255,255,255,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "grab",
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "active",
                cond: [{property: kViewProperties.hovered, path: "", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(70, 70, 70, 1.0)")],
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(10),
                    color: new Fill(true, "color", "normal", "rgba(255,255,255,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "grab",
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "inactive",
                fills: [new Fill(true, "color", "normal", "rgba(45, 45, 45, 1.0)")],
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(10),
                    color: new Fill(true, "color", "normal", "rgba(255,255,255,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "click",
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "inactive",
                cond: [{property: kViewProperties.hovered, path: "", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(55, 55, 55, 1.0)")],
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(10),
                    color: new Fill(true, "color", "normal", "rgba(255,255,255,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "click",
                userSelect: "none"
            },

        ];

    }

    get titleBarButtonStyle(): ViewStyle[] {

        return [
            setProps(new ViewStyle(),
                {
                    borderRadius: new BorderRadius(3, 3, 3, 3),
                    borders: [new Border(true, 1, "solid", "rgba(50, 50, 50, 1.0)", BorderSide.all)],
                    shadows: [new Shadow(true, 0, 1, 1, 1, Color.fromString("rgba(50, 50, 59, 1.0)"), false)],
                    fills: [new Fill(true, "color", "gradient", "linear-gradient(rgba(139, 139, 139, 1.0), rgba(127, 126, 128, 1.0))")],
                    textStyle: setProps(new PropertyTextStyle(), {
                        textAlignment: "center",
                        color: new Fill(true, "color", "normal", "rgba(255, 255, 255, 1.0)"),
                        size: px(14)
                    } as PropertyTextStyle)
                } as ViewStyle),
            setProps(new ViewStyle(),
                {
                    cond: [
                        {
                            property: "view.hovered",
                            value: true,
                            op: "equals",
                            path: ""
                        }
                    ],
                    fills: [new Fill(true, "color", "gradient", "linear-gradient(to-bottom, rgba(139, 139, 139, 1.0), rgba(127, 126, 128, 1.0))")]
                } as ViewStyle)
        ]
    }

    get titleBarDropdownStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(),
                {
                    borderRadius: new BorderRadius(3, 3, 3, 3),
                    //borders: [new Border(true, 1, "solid", "rgba(50, 50, 50, 1.0)", BorderSide.all)],
                    shadows: [new Shadow(true, 0, 1, 1, 1, Color.fromString("rgba(50, 50, 59, 1.0)"), false)],

                    fills: [new Fill(true, "color", "gradient", "linear-gradient(rgba(139, 139, 139, 1.0), rgba(127, 126, 128, 1.0))")],
                    textStyle: setProps(new PropertyTextStyle(), {
                        color: new Fill(true, "color", "normal", "rgba(255, 255, 255, 1.0)"),
                        size: px(14)
                    } as PropertyTextStyle)
                } as ViewStyle),
            setProps(new ViewStyle(),
                {
                    cond: [
                        {
                            property: "view.hovered",
                            value: true,
                            op: "equals",
                            path: ""
                        }
                    ],
                    fills: [new Fill(true, "color", "gradient", "linear-gradient(rgba(139, 139, 139, 1.0), rgba(127, 126, 128, 1.0))")],
                } as ViewStyle)
        ]
    }


    get treeViewStyle(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                fills: [new Fill(true, "color", "normal", this.listBackgroundColor)]
            },
            {
                kind: "ViewStyle",
                id: "cell",
                cond: [],
                fills: [new Fill(true, "color", "normal", this.listRowNormalColor)],
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "cell",
                cond: [{property: "view.hovered", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(24, 144, 255, 0.1)")],
                userSelect: "none"
                // borders: [new Border(true, 2, "solid", "rgba(24, 144, 255, 1.0)")]
            },
            {
                kind: "ViewStyle",
                id: "cell",
                cond: [{property: "cell.isSelected", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", this.listRowSelectedColor)],
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "expandCollapseIcon",
                textStyle: setProps(new PropertyTextStyle(), {
                    color: new Fill(true, "color", "normal", this.textColor)
                } as PropertyTextStyle),
                userSelect: "none"
            }
        ]
    }

    get tableViewStyleOLD(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                fills: []
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "cell.isEven", op: "equals", value: false}],
                fills: [new Fill(true, "color", "normal", "rgba(82, 81, 83, 1.0)")]
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "cell.isEven", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(88, 87, 88, 1.0)")]
            },

        ]
    }


    get tableViewStyle(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                fills: []
            },
            {
                kind: "ViewStyle",
                id: "header",
                fills: [new Fill(true, "color", "normal", "rgb(38, 38, 38)")],
                //borders: [new Border(true, 1, "solid", "rgb(232, 232, 232)", BorderSide.bottom)],

            },
            {
                kind: "ViewStyle",
                id: "column",
                fills: [],
                //borders: [new Border(true, 1, "solid", "rgba(50, 50, 50, 1.0)", BorderSide.right)]
            },
            {
                kind: "ViewStyle",
                id: "column.label",
                textStyle: setProps(new PropertyTextStyle(), {
                    color: new Fill(true, "color", "normal", "rgba(250, 250, 250, 1.0)")
                } as PropertyTextStyle)
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "cell.isEven", op: "equals", value: false}],
                fills: [new Fill(true, "color", "normal", "rgb(82,81,83)")]
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "cell.isEven", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgb(88,87,88)")]
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "view.hovered", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(24, 144, 255, 0.1)")]
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "cell.isSelected", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(24, 144, 255, 1)")]
            },

        ];
    }


    get toolbarStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(),
                {
                    fills: [new Fill(true, "color", "normal", "rgba(72, 72, 72, 1.0)")]
                } as ViewStyle)
        ]
    }

    get codeEditorFunctionHeaderStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(),
            {
                fills: [new Fill(true, "color", "normal", "rgba(38, 38, 38, 1.0)")],
                textStyle: setProps(new PropertyTextStyle(), {
                    color: new Fill(true, "color", "normal", "rgba(250, 250, 250, 1.0)")
                } as PropertyTextStyle)
            } as ViewStyle)
        ]
    }



    get popoverStyle(): ViewStyle[] {
        return [{
            kind: "ViewStyle",
            id: "popover",
            cond: [],
            fills: [new Fill(true, "gradient", "normal", "linear-gradient(0deg, rgb(54, 54, 54), rgb(65, 65, 65))")], //[new Fill(true, "color", "normal", "rgba(38, 54, 67, 1.0)")],
            borderRadius: {
                tl: new NumberWithUnit(3, "px"),
                tr: new NumberWithUnit(3, "px"),
                bl: new NumberWithUnit(3, "px"),
                br: new NumberWithUnit(3, "px")
            },
            zIndex: "9999"
        },
            {
                kind: "ViewStyle",
                id: "popoverArrow",
                cond: [],
                fills: [new Fill(true, "normal", "normal", "rgb(54, 54, 54)")], //[new Fill(true, "color", "normal", "rgba(38, 54, 67, 1.0)")],
                zIndex: "9999"
            },
            {
                kind: "ViewStyle",
                id: "popoverBackground",
                cond: [],
                fills: [new Fill(true, "gradient", "normal", "linear-gradient(\n" +
                    "to bottom,\n" +
                    "rgba(134, 134, 134, 1.0),\n" +
                    "rgba(84, 84, 84, 1.0)\n" +
                    ")")],
                shadows: [new Shadow(true, 1, 3, 4, 0, new Fill(true, "color", "normal", "rgba(50, 50, 50, 0.2)"),false),
                    new Shadow(true, -1, 6, 8, 0, new Fill(true, "color", "normal", "rgba(50, 50, 50, 0.2)"), false)
                ],
                borderRadius: {tl: new NumberWithUnit(3, "px"), tr: new NumberWithUnit(3, "px"), bl: new NumberWithUnit(3, "px"), br: new NumberWithUnit(3, "px")},
                zIndex: "9998"
            },
            {
                kind: "ViewStyle",
                id: "popoverBackgroundArrow",
                cond: [],
                fills: [new Fill(true, "color", "normal", "rgba(134, 134, 134, 1.0)")],
                shadows: [new Shadow(true, 1, 3, 4, 0, new Fill(true, "color", "normal", "rgba(50, 50, 50, 0.2)"),false),
                    new Shadow(true, -1, 6, 8, 0, new Fill(true, "color", "normal", "rgba(50, 50, 50, 0.2)"), false)
                ],
                zIndex: "9998"
            }


            ];
    }

    get labelStyleTitle(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                textStyle: setProps(new PropertyTextStyle(), {
                    weight: this.systemFont,
                    weightValue: '300',
                    textAlignment: 'left',
                    size: px(24),
                    openTypeTags: ['liga'],
                    color: new Fill(true, "color", "normal", this.textColor)
                } as PropertyTextStyle),
                userSelect: "none"
            }
        ];
    }


    get labelStyleItem(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                textStyle: setProps(new PropertyTextStyle(), {
                    weight: this.systemFont,
                    weightValue: '300',
                    textAlignment: 'left',
                    size: px(12),
                    openTypeTags: ['liga'],
                    color: new Fill(true, "color", "normal", this.textColor)
                } as PropertyTextStyle),
                userSelect: "none"
            }
        ];
    }

    get labelStyleSmall(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                textStyle: setProps(new PropertyTextStyle(), {
                    weight: this.systemFont,
                    weightValue: '300',
                    textAlignment: 'left',
                    size: px(12),
                    openTypeTags: ['liga'],
                    color: new Fill(true, "color", "normal", this.textColor)
                } as PropertyTextStyle),
                userSelect: "none"
            }
        ];
    }


    get topBarColor(): string { return "rgba(55, 55, 55, 1.0)"; }
    get topBarLabelColor(): string { return  "rgba(223, 223, 223, 1.0)"; }

    get topBarButtonStyle(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                cursor: "pointer",
                fills: [],
                textStyle: setProps(new PropertyTextStyle(),{
                    color: new Fill(true, "color", "normal", "rgba(95, 95, 95, 1.0)")
                } as PropertyTextStyle)
            },
            {
                kind: "ViewStyle",
                cursor: "pointer",
                cond: [{property: kViewProperties.hovered, op: "equals", path: "", value: true}],
                textStyle: setProps(new PropertyTextStyle(),{
                    color: new Fill(true, "color", "normal", "#40a9ff")
                } as PropertyTextStyle)
            }
        ]
    }

    get sideBarColor(): string { return  "rgba(14, 21, 27, 1.0)"; }


    get panelTabType(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                fills: [new Fill(true, "color", "normal", this.tabBackgroundColor)],
                textStyle: setProps(new PropertyTextStyle(),
                    {
                        weight: this.systemFont,
                        size: px(10),
                        lineHeight: px(20),
                        color: new Fill(true, "color", "normal", this.textColor)
                    } as PropertyTextStyle)
            }
        ]
    }



    get buttonStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(),
                {
                    borderRadius: new BorderRadius(3, 3, 3, 3),
                    borders: [new Border(true, 1, "solid", "rgba(50, 50, 50, 1.0)", BorderSide.all)],
                    shadows: [new Shadow(true, 0, 1, 1, 1, Color.fromString("rgba(50, 50, 59, 1.0)"), false)],
                    fills: [new Fill(true, "gradient", "normal", "linear-gradient(rgba(61, 61, 61, 1.0), rgba(57, 57, 57, 1.0))")],
                    textStyle: setProps(new PropertyTextStyle(), {
                        textAlignment: "center",
                        color: new Fill(true, "color", "normal", "rgba(224, 224, 225, 1.0)")
                    } as PropertyTextStyle)
                } as ViewStyle),
            setProps(new ViewStyle(),
                {
                    cond: [
                        {
                            property: "view.hovered",
                            value: true,
                            op: "equals",
                            path: ""
                        }
                    ],
                    fills: [new Fill(true, "gradient", "normal", "linear-gradient(rgba(61, 61, 61, 1.0), rgba(57, 57, 57, 1.0))")],
                } as ViewStyle)
        ]
    }

    get dropdownStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(),
                {
                    borderRadius: new BorderRadius(3, 3, 3, 3),
                    //borders: [new Border(true, 1, "solid", "rgba(50, 50, 50, 1.0)", BorderSide.all)],
                    shadows: [new Shadow(true, 0, 1, 1, 1, Color.fromString("rgba(50, 50, 59, 1.0)"), false)],

                    fills: [new Fill(true, "gradient", "normal", "linear-gradient(rgba(61, 61, 61, 1.0), rgba(57, 57, 57, 1.0))")],
                    textStyle: setProps(new PropertyTextStyle(), {
                        color: new Fill(true, "color", "normal", "rgba(224, 224, 225, 1.0)"),
                        size: px(10)
                    } as PropertyTextStyle)
                } as ViewStyle),
            {
                id: "glyph",
                textStyle: setProps(new PropertyTextStyle(), {
                    color: new Fill(true, "color", "normal", "rgba(224, 224, 225, 1.0)"),
                    size: px(10),
                    textAlignment: "center",
                    weight: "FontAwesome5ProSolid",
                    fillLineHeight: true
                } as PropertyTextStyle)
            } as ViewStyle,
            setProps(new ViewStyle(),
                {
                    cond: [
                        {
                            property: kViewProperties.hovered,
                            value: true,
                            op: "equals",
                            path: ""
                        }
                    ],
                    fills: [new Fill(true, "gradient", "normal", "linear-gradient(rgba(77, 77, 77, 1.0), rgba(61, 61, 61, 1.0))")],
                } as ViewStyle)
        ]
    }


    get layersListRowBackgroundColor(): string { return  "rgba(86, 86, 86, 1.0)"; }
    get layersListRowLayerTextColor(): string { return  this.textColor; }

    get tableViewHeaderBackgroundColor(): string { return  "rgba(38, 38, 38, 1.0)"; }
    get tableViewHeaderLabelColor(): string { return  "rgba(180, 180, 180, 1.0)"; }



}


