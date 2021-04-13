import express from "express";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";
import { Key, Shorten } from "./src/types";
import { logToDiscord } from "./src/utils";
import { nanoid } from "nanoid";
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
    return res.json({
        success: true,
        message: "Hey, this API isn't public yet but you can look at the code over at:",
        link: "https://github.com/thaldrin/brevis"
    });
});

app.get("/:slug", async (req, res) => {
    let { data, error } = await supabase
        .from<Shorten>("brevis").select().eq("slug", req.params.slug).limit(1);

    if (data?.length === 0) {
        return res.json({
            success: false,
            message: "The Link you are trying to visit does not exist.",
        });
    }

    if (error !== null) {
        return res.json({
            success: false,
            message: "We ran into an Error while proccessing your Request.",
        });
    }
    // @ts-ignore
    return res.redirect(data[0].url);
});

app.post('/', async (req, res) => {
    let { authorization } = req.headers
    let { url, slug } = req.body
    if (!authorization) {
        return res.json({
            success: false,
            message: "You have not passed an API Key into the Authorization Header."
        })

    }
    let { data: data_key, error: key_error } = await supabase.from<Key>("apikeys").select().eq('key', authorization)
    // if() return
    if (data_key?.length === 0) {
        return res.json({
            success: false,
            message: "You are not Authorized to use this API."
        })
    }
    if (!url) {
        return res.json({
            success: false,
            message: "You need to supply a URL to shorten."
        })
    }
    if (!slug) slug = nanoid(6)
    let { data: slug_data, error: slug_error } = await supabase.from<Shorten>('brevis').select().eq('slug', slug).limit(1)
    // @ts-ignore
    if (slug_data[0] && slug === slug_data[0].slug) {
        return res.json({
            success: false,
            message: "A Shorten with this Slug already exists, please choose another or try again."
        })
    }
    let { data: insert_shorten_data, error: insert_shorten_error } = await supabase.from<Shorten>('brevis').insert({
        // @ts-ignore
        slug, creator: data_key[0].id, url,
    })
    if (process.env.BREVIS_WEBHOOK) {
        // @ts-ignore
        await logToDiscord(`**${data_key[0].id}** (${data_key[0].reason})\nshortened <${url}> with /${slug}`)
    }
    // @ts-ignore
    console.log(`${data_key[0].id} (${data_key[0].reason}) shortened ${url} with /${slug}`)

    return res.json({})
})

// default catch all handler
app.all("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "route not defined",
        data: null,
    });
});

module.exports = app;