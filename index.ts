import express from "express";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";
import { Shorten } from "./src/types";

const app = express();
// @ts-ignore
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(helmet());


app.get("/", async (req, res) => {
    let { data, error } = await supabase.from<Shorten>("brevis").select()
    if (error) return res.status(400).json(error)

    console.log(data)

    return res.json({
        data
    })
})

app.get("/:slug", async (req, res) => {
    let { data, error } = await supabase.from<Shorten>("brevis").select()
    if (error) return res.status(400).json(error)

    return res.json({
        data: data
    })
})


// default catch all handler
app.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'route not defined',
        data: null,
    });
});

module.exports = app;