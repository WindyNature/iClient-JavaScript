﻿import SuperMap from '../SuperMap';
import PointWithMeasure from './PointWithMeasure';

const Collection = SuperMap.Geometry.Collection;

/**
 * @class SuperMap.Route
 * @classdesc
 * 路由对象类。路由对象为一系列有序的带有属性值 M 的 x，y 坐标对，其中 M 值为该结点的距离属性（到已知点的距离）。
 * @param points - {Array} 形成路由对象的线数组。
 * @param  options - {Object} 可选参数。如:</br>
 *         id - {number}路由对象在数据库中的id。</br>
 *         length - {number}路由对象的长度。</br>
 *         maxM - {number}最大线性度量值，即所有结点到起始点的量算距离中最大值。</br>
 *         minM - {number}最小线性度量值，即所有结点到起始点的量算距离中最小值。</br>
 *         type - {string} 数据类型，如："LINEM"</br>
 * @extends SuperMap.Geometry.Collection
 */
export default  class Route extends Collection {

    /**
     * @member SuperMap.Route.prototype.id -{number}
     * @description 路由对象在数据库中的id。
     */
    id = null;

    /**
     * @member SuperMap.Route.prototype.center -{number}
     */
    center = null;

    /**
     * @member SuperMap.Route.prototype.style -{string}
     */
    style = null;

    /**
     * @member SuperMap.Route.prototype.length -{number}
     * @description 路由对象的长度。
     * 单位与数据集的单位相同。
     */
    length = null;

    /**
     *  @member SuperMap.Route.prototype.maxM -{number}
     *  @description 最大线性度量值，即所有结点到起始点的量算距离中最大值。
     */
    maxM = null;

    /**
     * @member SuperMap.Route.prototype.minM -{number}
     * @description 最小线性度量值，即所有结点到起始点的量算距离中最小值。
     */
    minM = null;

    /**
     * @member SuperMap.Route.prototype.parts -{Array<Number>}
     * @description 服务端几何对象中各个子对象所包含的节点个数。
     */
    parts = null;

    /**
     * @member SuperMap.Route.prototype.points -{Array<Object>}
     * @description 路由对象的所有路由点。
     * @example
     * (start code)
     * [
     *  {
     *      "measure": 0,
     *      "y": -4377.027184298267,
     *      "x": 4020.0045221720466
     *  },
     *  {
     *      "measure": 37.33288381391519,
     *      "y": -4381.569363260499,
     *      "x": 4057.0600591960642
     *  }
     * ]
     * (end)
     */
    points = null;

    /**
     * @member SuperMap.Route.prototype.type -{string}
     * @description 服务端几何对象类型。
     */
    type = null;

    /**
     * @member SuperMap.Route.prototype.components -{Array<SuperMap.Geometry>}
     * @description 存储几何对象的数组。
     */
    components = null;

    /**
     * @member SuperMap.Route.prototype.componentTypes -{string}
     */
    componentTypes = ["SuperMap.Geometry.LinearRing", "SuperMap.Geometry.LineString"];

    constructor(points, options) {
        super(points, options);
        if (options) {
            SuperMap.Util.extend(this, options);
        }
    }

    /**
     *
     * @function SuperMap.Route.prototype.toJson
     * @description 转换为json对象。
     */
    toJson() {
        var result = "{";
        if (this.id != null && this.id != undefined) {
            result += "\"id\":" + this.id + ",";
        }
        if (this.center != null && this.center != undefined) {
            result += "\"center\":" + this.center + ",";
        }
        if (this.style != null && this.style != undefined) {
            result += "\"style\":" + this.style + ",";
        }
        if (this.length != null && this.length != undefined) {
            result += "\"length\":" + this.length + ",";
        }
        if (this.maxM != null && this.maxM != undefined) {
            result += "\"maxM\":" + this.maxM + ",";
        }
        if (this.minM != null && this.minM != undefined) {
            result += "\"minM\":" + this.minM + ",";
        }
        if (this.type != null && this.type != undefined) {
            result += "\"type\":\"" + this.type + "\",";
        }
        if (this.parts != null && this.parts != undefined) {
            result += "\"parts\":[" + this.parts[0];

            for (var i = 1; i < this.parts.length; i++) {
                result += "," + this.parts[i];
            }
            result += "],";
        }
        if (this.components != null && this.components.length > 0) {
            result += "\"points\":[";
            for (var j = 0, len = this.components.length; j < len; j++) {
                for (var k = 0, len2 = this.components[j].components.length; k < len2; k++) {
                    result += this.components[j].components[k].toJson() + ",";
                }
            }
            result = result.replace(/,$/g, '');
            result += "]";
        }
        result = result.replace(/,$/g, '');
        result += "}";
        return result;
    }


    /**
     * @inheritDoc
     */
    destroy() {
        var me = this;
        me.id = null;
        me.center = null;
        me.style = null;
        me.length = null;
        me.maxM = null;
        me.minM = null;
        me.type = null;
        me.parts = null;
        this.components.length = 0;
        this.components = null;
        this.componentTypes = null;
    }


    /**
     * @function SuperMap.Route.fromJson
     * @description  将 JSON 对象转换为 SuperMap.Route 对象。
     * @param jsonObject - {Object} JSON 对象表示的路由对象。
     * @return {SuperMap.Route} 转化后的 Route 对象。
     */
    static fromJson(jsonObject) {
        if (!jsonObject) {
            return;
        }

        var geoParts = jsonObject.parts || [],
            geoPoints = jsonObject.points || [],
            len = geoParts.length,
            lineList = [];
        if (len > 0) {
            for (var i = 0, pointIndex = 0, pointList = []; i < len; i++) {
                for (var j = 0; j < geoParts[i]; j++) {
                    pointList.push(PointWithMeasure.fromJson(geoPoints[pointIndex + j]));
                }
                pointIndex += geoParts[i];
                //判断线是否闭合，如果闭合，则返回LinearRing，否则返回LineString
                if (pointList[0].equals(pointList[geoParts[i] - 1])) {
                    lineList.push(new SuperMap.Geometry.LinearRing(pointList));
                } else {
                    lineList.push(new SuperMap.Geometry.LineString(pointList));
                }
                pointList = [];
            }

        } else {
            return null;
        }

        return new Route(lineList, {
            id: jsonObject.id,
            center: jsonObject.center,
            style: jsonObject.style,
            length: jsonObject.length,
            maxM: jsonObject.maxM,
            minM: jsonObject.minM,
            type: jsonObject.type,
            parts: jsonObject.parts
        });
    }

    CLASS_NAME = "SuperMap.Route"
}

SuperMap.Route = Route;