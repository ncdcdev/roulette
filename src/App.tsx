import { AnimatePresence,motion } from "framer-motion";
import { Play,Plus, Share2, Trash2 } from "lucide-react";
import React, { useEffect,useState } from "react";

interface Item {
    name: string;
    weight: number;
}

interface RouletteState {
    items: Item[];
    results: string[];
    drawCount: number;
    shareUrl: string;
}

const getRandomItem = (
    items: Item[],
    exclude: string[] = [],
): string | undefined => {
    const availableItems = items.filter((item) => !exclude.includes(item.name));
    const totalWeight = availableItems.reduce(
        (sum, item) => sum + item.weight,
        0,
    );
    let random = Math.random() * totalWeight;

    for (const item of availableItems) {
        random -= item.weight;
        if (random <= 0) return item.name;
    }
    return availableItems[0]?.name;
};

const RouletteApp: React.FC = () => {
    const [state, setState] = useState<RouletteState>({
        items: [{ name: "", weight: 1 }],
        results: [],
        drawCount: 1,
        shareUrl: "",
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const draws = params.get("draws");
        const loadedItems: Item[] = [];

        let i = 0;
        while (params.has(`name${i}`)) {
            loadedItems.push({
                name: params.get(`name${i}`) ?? "",
                weight: Number(params.get(`weight${i}`) ?? "1"),
            });
            i++;
        }

        setState((prev) => ({
            ...prev,
            drawCount: draws ? parseInt(draws) : 1,
            items: loadedItems.length > 0 ? loadedItems : prev.items,
        }));
    }, []);

    const addItem = (): void => {
        setState((prev) => ({
            ...prev,
            items: [...prev.items, { name: "", weight: 1 }],
        }));
    };

    const removeItem = (index: number): void => {
        setState((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const updateItem = (
        index: number,
        field: keyof Item,
        value: string | number,
    ): void => {
        setState((prev) => {
            const newItems = [...prev.items];
            newItems[index] = {
                ...newItems[index],
                [field]:
                    field === "weight" ? Math.max(1, Number(value)) : value,
            };
            return { ...prev, items: newItems };
        });
    };

    const spin = (): void => {
        const draws = Math.min(state.drawCount, state.items.length);
        const newResults: string[] = [];

        for (let i = 0; i < draws; i++) {
            const result = getRandomItem(state.items, newResults);
            if (result) newResults.push(result);
        }

        setState((prev) => ({ ...prev, results: newResults }));
    };

    const share = (): void => {
        const params = new URLSearchParams();
        state.items.forEach((item, i) => {
            params.append(`name${i}`, item.name);
            params.append(`weight${i}`, item.weight.toString());
        });
        params.append("draws", state.drawCount.toString());

        const url = `${
            window.location.href.split("?")[0]
        }?${params.toString()}`;
        setState((prev) => ({ ...prev, shareUrl: url }));
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="mx-auto max-w-3xl px-4">
                <motion.h1
                    className="mb-8 text-3xl font-bold text-gray-800"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Roulette
                </motion.h1>

                <motion.div
                    className="mb-6 rounded-lg bg-white p-6 shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="space-y-4">
                        <AnimatePresence>
                            {state.items.map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Item name"
                                        value={item.name}
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                        className="flex-1 rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.weight}
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                "weight",
                                                e.target.value,
                                            )
                                        }
                                        className="w-24 rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeItem(index)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 size={20} />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={addItem}
                            className="flex items-center gap-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                        >
                            <Plus size={20} />
                            Add Item
                        </motion.button>

                        <div className="mt-4">
                            <label className="block text-gray-700">
                                Number of draws:
                                <input
                                    type="number"
                                    min="1"
                                    value={state.drawCount}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            drawCount: Math.max(
                                                1,
                                                parseInt(e.target.value) || 1,
                                            ),
                                        }))
                                    }
                                    className="mt-1 block w-24 rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                            </label>
                        </div>
                    </div>
                </motion.div>

                <div className="mb-6 flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={spin}
                        className="flex items-center gap-2 rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
                    >
                        <Play size={20} />
                        Spin
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={share}
                        className="flex items-center gap-2 rounded bg-purple-500 px-6 py-2 text-white hover:bg-purple-600"
                    >
                        <Share2 size={20} />
                        Share URL
                    </motion.button>
                </div>

                <AnimatePresence>
                    {state.shareUrl && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 break-all rounded-lg bg-gray-50 p-4 text-sm text-gray-600"
                        >
                            {state.shareUrl}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className="rounded-lg bg-white p-6 shadow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <AnimatePresence mode="wait">
                        {state.results.map((result, index) => (
                            <motion.div
                                key={result + index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={`mb-2 ${
                                    index > 0 ? "mt-4 border-t pt-4" : ""
                                }`}
                            >
                                <span className="ml-2 text-xl font-bold">
                                    {result}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default RouletteApp;
