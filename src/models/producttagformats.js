// List of tag/label sheet formats. Units are in mm for position and margins.
const MM_TO_PT = 2.8346456693
var productTagFormats = [
	{
		"dispName": "A4 50x20 x56",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 5, "h": 5},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 20, "colSize": 50, "rowNum": 14, "colNum": 4 },
		"label": { "x": 0, "y": 0, "width": 48, "dots": 7, "frame": 0},
		"barcode": { "x": 0, "y": 7, "width": 24, "height": 9, "angle": 0,
			"text": { "x": 0, "y": 16, "height": 4, "dots": 6, "frame": 0}
		},
		"price": { "x": 24, "y": 7, "width": 24, "height": 6, "dots": 14, "frame": "LTR"},
		"unit": { "x": 24, "y": 13, "width": 24, "height": 3, "dots": 6, "frame": "LBR"},
		"reference": { "x": 24, "y": 16, "width": 24, "dots": 6, "frame": 0}
	},
	{
		"dispName": "A5 20x8 51",
		"paper": { "size": "A5", "orientation": "portrait"},
		"margin": { "v": 7.1, "h": 2.4},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 8, "colSize": 20, "rowNum": 17, "colNum": 7 },
		"label": { "x": -0.1, "y": 0, "width": 20, "dots": 4, "frame": 0},
		"barcode": { "x": -0.1, "y": 3, "width": 19, "height": 3, "angle": 0,
			"text": { "x": 0, "y": 6, "height": 2, "dots": 4, "frame": 0}
		},
		"price": { "x": 0.5, "y": 0.5, "width": 19, "height": 4, "dots": 10, "frame": "LTR"},
		"unit": { "x": 0.5, "y": 4, "width": 19, "height": 2, "dots": 4, "frame": "LBR"},
		"reference": { "x": -0.1, "y": 6, "width": 10, "dots": 3, "frame": 0}
	},
	{
		"dispName": "Print 100631 51x33.8 32",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 13.5, "h": 4},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 33.8, "colSize": 51, "rowNum": 8, "colNum": 4 },
		"label": { "x": 2, "y": 0, "width": 47, "dots": 9, "frame": 0},
		"barcode": { "x": 2, "y": 13, "width": 23, "height": 14, "angle": 0,
			"text": { "x": 2, "y": 27, "height": 6, "dots": 8, "frame": 0}
		},
		"price": { "x": 25, "y": 13, "width": 24, "height": 10, "dots": 14, "frame": "LTR"},
		"unit": { "x": 25, "y": 23, "width": 24, "height": 4, "dots": 8, "frame": "LBR"},
		"reference": { "x": 25, "y": 27, "width": 24, "dots": 8, "frame": 0}
	},
	{
		"dispName": "Print 100974 20x8 51",
		"paper": { "size": "A5", "orientation": "portrait"},
		"margin": { "v": 7.1, "h": 2.4},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 8, "colSize": 20, "rowNum": 7, "colNum": 17 },
		"label": { "x": -0.1, "y": 0, "width": 20, "dots": 4, "frame": 0},
		"barcode": { "x": -0.1, "y": 2, "width": 20, "height": 4, "angle": 0,
			"text": { "x": 0, "y": 6, "height": 4, "dots": 4, "frame": 0}
		},
		"price": { "x": 0.5, "y": 0.5, "width": 19, "height": 5, "dots": 11, "frame": "LTR"},
		"unit": { "x": 0.5, "y": 4, "width": 19, "height": 2, "dots": 3, "frame": "LBR"},
		"reference": { "x": -0.1, "y": 6, "width": 10, "dots": 3, "frame": 0}
	},
	{
		"dispName": "Print 118990 38x21.2 65",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 10.5, "h": 10.5},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 21.2, "colSize": 38, "rowNum": 13, "colNum": 5 },
		"label": { "x": 1, "y": 1, "width": 36, "dots": 9, "frame": 0},
		"barcode": { "x": 1, "y": 8, "width": 17, "height": 10, "angle": 0,
			"text": { "x": 1, "y": 17.5, "height": 4, "dots": 6, "frame": 0}
		},
		"price": { "x": 19, "y": 8, "width": 17, "height": 6, "dots": 10, "frame": "LTR"},
		"unit": { "x": 19, "y": 14, "width": 17, "height": 4, "dots": 7, "frame": "LBR"},
		"reference": { "x": 19, "y": 17.5, "width": 17, "dots": 6, "frame": 0}
	},
	{
		"dispName": "Print 118991 48.5x25.4 40",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 21.5, "h": 8},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 25.4, "colSize": 48.5, "rowNum": 10, "colNum": 4 },
		"label": { "x": 2, "y": 0, "width": 44.5, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 10, "width": 22, "height": 10.4, "angle": 0,
			"text": { "x": 2, "y": 20.4, "height": 5, "dots": 7, "frame": 0}
		},
		"price": { "x": 24, "y": 10, "width": 22.5, "height": 7.4, "dots": 13, "frame": "LTR"},
		"unit": { "x": 24, "y": 17.4, "width": 22.5, "height": 3, "dots": 7, "frame": "LBR"},
		"reference": { "x": 24, "y": 20.4, "width": 22.5, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 118992 52.5x21.2 56",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 0, "h": 0},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 21.2, "colSize": 52.5, "rowNum": 14, "colNum": 4 },
		"label": { "x": 2, "y": 1, "width": 48.5, "dots": 8, "frame": 0},
		"barcode": { "x": 2, "y": 7.5, "width": 24, "height": 10, "angle": 0,
			"text": { "x": 2, "y": 17.5, "height": 4, "dots": 6, "frame": 0}
		},
		"price": { "x": 26, "y": 7.5, "width": 24, "height": 7, "dots": 13, "frame": "LTR"},
		"unit": { "x": 26, "y": 14.5, "width": 24, "height": 3, "dots": 7, "frame": "LBR"},
		"reference": { "x": 26, "y": 17.5, "width": 24, "dots": 6, "frame": 0}
	},
	{
		"dispName": "Print 118995 70x33.8 24",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 13.3, "h": 0},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 33.8, "colSize": 70, "rowNum": 8, "colNum": 3 },
		"label": { "x": 2, "y": 0, "width": 66, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 12, "width": 33, "height": 15, "angle": 0,
			"text": { "x": 2, "y": 27, "height": 5, "dots": 7, "frame": 0}
		},
		"price": { "x": 35, "y": 12, "width": 33, "height": 10, "dots": 20, "frame": "LTR"},
		"unit": { "x": 35, "y": 22, "width": 33, "height": 5, "dots": 7, "frame": "LBR"},
		"reference": { "x": 35, "y": 27, "width": 33, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 119007 70x25 33",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 10.5, "h": 0},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 25, "colSize": 70, "rowNum": 11, "colNum": 3 },
		"label": { "x": 2, "y": 0, "width": 66, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 10, "width": 32, "height": 11, "angle": 0,
			"text": { "x": 2, "y": 21, "height": 4, "dots": 7, "frame": 0}
		},
		"price": { "x": 34, "y": 10, "width": 34, "height": 7.5, "dots": 18, "frame": "LTR"},
		"unit": { "x": 34, "y": 17.5, "width": 34, "height": 3.5, "dots": 7, "frame": "LBR"},
		"reference": { "x": 34, "y": 21, "width": 34, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 119601 22x16 153",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 13, "h": 0},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 16, "colSize": 22, "rowNum": 17, "colNum": 9 },
		"label": { "x": -0.1, "y": 0, "width": 21, "dots": 4, "frame": 0},
		"barcode": { "x": 1, "y": 10.4, "width": 20, "height": 3.3, "angle": 0,
			"text": { "x": 1, "y": 13.3, "height": 3, "dots": 6, "frame": 0}
		},
		"price": { "x": 1, "y": 1, "width": 20, "height": 7, "dots": 12, "frame": "LTR"},
		"unit": { "x": 1, "y": 7.4, "width": 20, "height": 3, "dots": 7, "frame": "LBR"},
		"reference": { "x": -0.1, "y": 14, "width": 10, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 119602 50x20 56",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 13, "h": 5},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 20, "colSize": 50, "rowNum": 14, "colNum": 4 },
		"label": { "x": 2, "y": 0, "width": 46, "dots": 8, "frame": 0},
		"barcode": { "x": 2, "y": 8, "width": 23, "height": 8, "angle": 0,
			"text": { "x": 2, "y": 16, "height": 4, "dots": 7, "frame": 0}
		},
		"price": { "x": 25, "y": 8, "width": 23, "height": 6, "dots": 13, "frame": "LTR"},
		"unit": { "x": 25, "y": 13, "width": 23, "height": 3, "dots": 6, "frame": "LBR"},
		"reference": { "x": 25, "y": 16, "width": 23, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 119603 50x25 44",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 13, "h": 5},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 25, "colSize": 50, "rowNum": 11, "colNum": 4 },
		"label": { "x": 2, "y": 0, "width": 46, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 21, "width": 23, "height": 11, "angle": 0,
			"text": { "x": 2, "y": 21, "height": 7, "dots": 13, "frame": 0}
		},
		"price": { "x": 25, "y": 10, "width": 23, "height": 7, "dots": 13, "frame": "LTR"},
		"unit": { "x": 25, "y": 17, "width": 23, "height": 4, "dots": 7, "frame": "LBR"},
		"reference": { "x": 25, "y": 17, "width": 23, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 130142 48.5x25.4 44",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 9, "h": 8},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 25.4, "colSize": 48.5, "rowNum": 11, "colNum": 4 },
		"label": { "x": 2, "y": 0, "width": 44, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 10, "width": 22, "height": 11.4, "angle": 0,
			"text": { "x": 2, "y": 21.4, "height": 4, "dots": 7, "frame": 0}
		},
		"price": { "x": 24, "y": 10, "width": 23, "height": 7.4, "dots": 13, "frame": "LTR"},
		"unit": { "x": 24, "y": 17.4, "width": 23, "height": 4, "dots": 7, "frame": "LBR"},
		"reference": { "x": 24, "y": 21.4, "width": 23, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Apli 10387 67x25.4 30",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 22.3, "h": 4.5},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 25.4, "colSize": 67, "rowNum": 10, "colNum": 3 },
		"label": { "x": 2, "y": 0, "width": 63, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 10, "width": 31, "height": 10.5, "angle": 0,
			"text": { "x": 2, "y": 20.5, "height": 5, "dots": 7, "frame": 0}
		},
		"price": { "x": 33, "y": 10, "width": 32, "height": 7.4, "dots": 18, "frame": "LTR"},
		"unit": { "x": 33, "y": 17.4, "width": 32, "height": 3, "dots": 7, "frame": "LBR"},
		"reference": { "x": 33, "y": 20.4, "width": 32, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Alpi 13050 105x40 14",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 9, "h": 0},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 40, "colSize": 105, "rowNum": 7, "colNum": 2 },
		"label": { "x": 2, "y": 0, "width": 101, "dots": 14, "frame": 0},
		"barcode": { "x": 2, "y": 15, "width": 50, "height": 20, "angle": 0,
			"text": { "x": 2, "y": 35, "height": 5, "dots": 10, "frame": 0}
		},
		"price": { "x": 52, "y": 15, "width": 51, "height": 15, "dots": 30, "frame": "LTR"},
		"unit": { "x": 52, "y": 30, "width": 51, "height": 5, "dots": 11, "frame": "LBR"},
		"reference": { "x": 52, "y": 35, "width": 51, "dots": 10, "frame": 0}
	},
	{
		"dispName": "Alpi 13051 65x33 27",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 0, "h": 8},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 33, "colSize": 65, "rowNum": 9, "colNum": 3 },
		"label": { "x": 2, "y": 0, "width": 61, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 15, "width": 30, "height": 13, "angle": 0,
			"text": { "x": 2, "y": 28, "height": 5, "dots": 7, "frame": 0}
		},
		"price": { "x": 32, "y": 15, "width": 31, "height": 10, "dots": 18, "frame": "LTR"},
		"unit": { "x": 32, "y": 25, "width": 31, "height": 3, "dots": 7, "frame": "LBR"},
		"reference": { "x": 32, "y": 28, "width": 31, "dots": 7, "frame": 0}
	},
];
