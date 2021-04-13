import express from "express";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";
import { Shorten } from "./src/types";

const app = express();
const supabase = createClient(
    // @ts-ignore
    process.env.SUPABASE_URL,
    // @ts-ignore
    process.env.SUPABASE_KEY
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(helmet());

app.get("/", async (req, res) => {
    let { data, error } = await supabase.from<Shorten>("brevis").select();
    if (error) return res.status(400).json(error);
    return res.json({
        data,
    });
});

app.get("/:slug", async (req, res) => {
    let { data, error } = await supabase
        .from<Shorten>("brevis").select().eq("slug", req.params.slug).limit(1);

    if (data?.length === 0) {
        return res.json({
            success: false,
            msg: "The Link you are trying to visit does not exist.",
        });
    }

    if (error !== null) {
        return res.json({
            success: false,
            msg: "We ran into an Error while proccessing your Request.",
        });
    }
    // @ts-ignore
    return res.redirect(data[0].url);
});

// default catch all handler
app.all("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "route not defined",
        data: null,
    });
});

module.exports = app;