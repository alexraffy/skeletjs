import {DragPayload} from "./DragPayload";
import {Layer} from "../Layer/Layer";
import {testMagnet} from "./testMagnet";
import {isDefined} from "mentatjs";
import {SkLogger} from "../Logging/SkLogger";


export function checkSnapOpportunities(dragPayload: DragPayload, event)
    : {done: boolean, distance: number, offsetX?: number, offsetY?: number, target?: Layer }[] {

    let allTests: {done: boolean, distance: number, absoluteDistance: number, offsetX?: number, offsetY?: number, target?: Layer }[][] = [];
    let magnets = dragPayload.alignmentLines; // getAlignmentLines(dragPayload);
    // SkLogger.write(magnets.length + " magnets ", magnets);
    for (let i = 0; i < dragPayload.nodes.length; i += 1) {
        let n = dragPayload.nodes[i].node;

        let nb = n.bounds();

        let testResults: {done: boolean, distance: number, absoluteDistance: number, offsetX?: number, offsetY?: number, target?: Layer }[] = [];
        for (let x = 0; x < magnets.length; x += 1) {
            let test = testMagnet(nb, magnets[x], event.offsetX, event.offsetY);
            if (test.result === true) {
                let o: {
                    done: boolean,
                    distance: number,
                    absoluteDistance: number,
                    offsetX?: number,
                    offsetY?: number,
                    target?: Layer
                } = {
                    done: false,
                    distance: test.distance.amount,
                    absoluteDistance: test.absoluteDistance.amount
                };
                if (isDefined(test.x)) {
                    o.offsetX = test.x.amount;
                }
                if (isDefined(test.y)) {
                    o.offsetY = test.y.amount;
                }
                testResults.push(o);
            }
        }
        allTests.push(testResults);
    }

    allTests.sort(function (elem1, elem2) {
        return elem2.length - elem1.length;
    });
    //SkLogger.write("allTests: " + allTests[0].length + " or " + allTests[allTests.length - 1].length);
    //console.dir(allTests);
    if (allTests[0].length > 0) {
        SkLogger.write("Snap Match " + allTests[0].length);
    }
    // apply snaps
    let xSnap: {
        done: boolean,
        distance: number,
        offsetX?: number,
        offsetY?: number,
        target?: Layer
    } = {
        done: false,
        distance: 0
    };
    let ySnap: {
        done: boolean,
        distance: number,
        offsetX?: number,
        offsetY?: number,
        target?: Layer
    } = {
        done: false,
        distance: 0
    };

    let indexAllTests = -1;
    while (xSnap.done === false || ySnap.done === false) {
        indexAllTests += 1;
        if (indexAllTests === allTests.length) {
            break;
        }
        let indexTest = -1;
        while (xSnap.done === false || ySnap.done === false) {
            indexTest += 1;
            if (indexTest === allTests[indexAllTests].length) {
                break;
            }

            let m = allTests[indexAllTests][indexTest];

            if (isDefined(m.offsetX)) {
                xSnap.distance = m.absoluteDistance;
                xSnap.offsetX = m.distance;
                xSnap.target = m.target;
                xSnap.done = true;
            }
            if (isDefined(m.offsetY)) {
                ySnap.distance = m.absoluteDistance;
                ySnap.offsetY = m.distance;
                ySnap.target = m.target;
                ySnap.done = true;
            }



        }
    }

    if (xSnap.done === true) {
        if (dragPayload.stopX === false) {
            SkLogger.write("xSnap " + xSnap.offsetX + " " + xSnap.target.id);
            dragPayload.selectedNodesBounds.x.amount += xSnap.offsetX;
        }
    }
    if (ySnap.done === true) {
        if (dragPayload.stopY === false) {
            SkLogger.write("ySnap " + ySnap.offsetY + " " + ySnap.target.id);
            dragPayload.selectedNodesBounds.y.amount += ySnap.offsetY;
        }
    }


    return [xSnap, ySnap];

}


