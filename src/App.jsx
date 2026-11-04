import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Cuboid,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { defaultProducts } from "./data/products.js";
import { supabase } from "./lib/supabase.js";

const categories = ["Everything", "Collectibles", "Accessories", "Home & desk", "Toys"];
const supportedProductIds = new Set(defaultProducts.map((product) => product.id));

function ProductArtwork({ variant, className = "" }) {
  return (
    <div className={`product-art art-${variant} ${className}`} aria-hidden="true">
      <div className="art-glow" />
      <svg viewBox="0 0 240 200" fill="none">
        {variant === "hex" && (
          <g className="art-object">
            <path d="M120 32 177 65v66l-57 33-57-33V65l57-33Z" fill="#6246D9" />
            <path d="m120 32 57 33-57 34-57-34 57-33Z" fill="#A795FF" />
            <path d="m63 65 57 34v65l-57-33V65Z" fill="#7760EA" />
            <path d="m177 65-57 34v65l57-33V65Z" fill="#4530AE" />
            <path d="m95 74 25 14 25-14-25-15-25 15Z" fill="#D9D0FF" />
            <path d="m83 97 25 15v28l-25-15V97Z" fill="#B5A7FF" />
            <path d="m157 97-25 15v28l25-15V97Z" fill="#302181" />
          </g>
        )}
        {variant === "cone" && (
          <g className="art-object">
            <path d="m120 31 52 102-52 29-52-29 52-102Z" fill="#FE9B60" />
            <path d="m120 31 52 102-52-17V31Z" fill="#DF663D" />
            <path d="m68 133 52-17v46l-52-29Z" fill="#FFB37C" />
            <path d="m78 115 42-22 42 22-42 23-42-23Z" fill="#FFD4B3" />
            <path d="m85 107 35-18 35 18-35 19-35-19Z" fill="#F48653" />
            <ellipse cx="120" cy="153" rx="56" ry="12" fill="#B95637" opacity=".34" />
          </g>
        )}
        {variant === "ring" && (
          <g className="art-object">
            <path d="M120 42a50 50 0 1 0 0 100 50 50 0 0 0 0-100Zm0 24a26 26 0 1 1 0 52 26 26 0 0 1 0-52Z" fill="#36BCA9" fillRule="evenodd" />
            <ellipse cx="120" cy="79" rx="50" ry="19" fill="#8CE9DA" opacity=".9" />
            <ellipse cx="120" cy="79" rx="26" ry="10" fill="#153C49" />
            <path d="M70 78v20c0 25 22 45 50 45s50-20 50-45V78c0 11-22 20-50 20S70 89 70 78Z" fill="#159C91" />
            <ellipse cx="120" cy="78" rx="50" ry="19" fill="#58D4C1" />
            <ellipse cx="120" cy="78" rx="25" ry="9" fill="#214854" />
            <path d="M77 88c10 6 22 9 35 10" stroke="#C1FFF3" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        {variant === "cube" && (
          <g className="art-object">
            <path d="m120 31 57 33v67l-57 33-57-33V64l57-33Z" fill="#F0B640" />
            <path d="m120 31 57 33-57 34-57-34 57-33Z" fill="#FFE08A" />
            <path d="m63 64 57 34v66l-57-33V64Z" fill="#F7C85C" />
            <path d="m177 64-57 34v66l57-33V64Z" fill="#D88C25" />
            <path d="m120 98 57-34v22l-57 34-57-34V64l57 34Z" fill="#FFF1BF" opacity=".75" />
            <path d="M90 73v37m60-37v37M90 110l30 17 30-17" stroke="#B47720" strokeWidth="3" opacity=".68" />
            <ellipse cx="120" cy="166" rx="62" ry="10" fill="#A96D1E" opacity=".2" />
          </g>
        )}
        {variant === "bighex" && (
          <g className="art-object">
            <path d="M120 27 182 63v72l-62 36-62-36V63l62-36Z" fill="#E95B81" />
            <path d="m120 27 62 36-62 36-62-36 62-36Z" fill="#FFADC0" />
            <path d="m58 63 62 36v72l-62-36V63Z" fill="#FA7897" />
            <path d="m182 63-62 36v72l62-36V63Z" fill="#BF3F69" />
            <path d="m96 75 24 14 24-14-24-14-24 14Z" fill="#FFE6EB" />
            <path d="m80 104 29 17v31l-29-17v-31Z" fill="#FFD0D9" />
            <path d="m160 104-29 17v31l29-17v-31Z" fill="#8F2E52" />
          </g>
        )}
        {variant === "stand" && (
          <g className="art-object">
            <path d="m84 54 74-18 19 76-73 19-20-77Z" fill="#FFF4E1" stroke="#D8B985" strokeWidth="5" strokeLinejoin="round" />
            <path d="m71 115 91 10-28 42-79-11 16-41Z" fill="#38A79A" />
            <path d="m71 115 91 10-23 13-84-9 16-14Z" fill="#74D3C4" />
            <path d="m55 156 79 11 28-42 15 3-37 56-94-13 9-15Z" fill="#207E77" />
            <path d="m111 131 15 2" stroke="#D5FFF4" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        {variant === "cable" && (
          <g className="art-object">
            <path d="M73 122c0-31 16-50 45-50h17c23 0 35 13 35 32s-12 32-35 32h-23c-16 0-25 9-25 24" stroke="#435C8A" strokeWidth="19" strokeLinecap="round" />
            <path d="M73 122c0-31 16-50 45-50h17c23 0 35 13 35 32s-12 32-35 32h-23c-16 0-25 9-25 24" stroke="#94A9D6" strokeWidth="9" strokeLinecap="round" />
            <rect x="62" y="112" width="23" height="19" rx="6" fill="#31466E" />
            <rect x="79" y="150" width="19" height="20" rx="6" fill="#31466E" />
            <path d="M68 117v9m34 32v7" stroke="#D5E0F7" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
        {variant === "id" && (
          <g className="art-object">
            <rect x="65" y="39" width="110" height="126" rx="13" fill="#FFF9EB" stroke="#D9CBAE" strokeWidth="4" />
            <rect x="77" y="51" width="86" height="49" rx="8" fill="#E9E0FF" />
            <circle cx="120" cy="71" r="13" fill="#8769D9" />
            <path d="M96 95c3-10 12-15 24-15s21 5 24 15" fill="#A692EA" />
            <path d="M83 116h73M83 128h57M83 141h64" stroke="#BEB4A0" strokeWidth="5" strokeLinecap="round" />
            <path d="M72 48h14" stroke="#8A734B" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
        {variant === "miniature" && (
          <g className="art-object">
            <path d="m88 143 11-27 21-9 22 9 10 27-16 13h-34l-14-13Z" fill="#795B47" />
            <circle cx="120" cy="72" r="25" fill="#F2C291" />
            <path d="M96 69c2-21 12-33 27-33 15 0 25 12 26 32-8-7-17-12-27-12-10 0-19 5-26 13Z" fill="#49352F" />
            <path d="m99 118 21 15 21-15 10 25-16 14h-31l-15-14 10-25Z" fill="#6F8F78" />
            <path d="m92 147 28 8 28-8 9 15H83l9-15Z" fill="#D9A15F" />
            <circle cx="111" cy="74" r="2" fill="#45362E" />
            <circle cx="130" cy="74" r="2" fill="#45362E" />
            <path d="M114 87c4 3 8 3 12 0" stroke="#B66F57" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
        {variant === "phonecase" && (
          <g className="art-object">
            <rect x="76" y="27" width="88" height="148" rx="19" fill="#718BA8" stroke="#405B79" strokeWidth="5" />
            <rect x="83" y="35" width="74" height="132" rx="14" fill="#AFC6D6" />
            <rect x="91" y="45" width="38" height="38" rx="11" fill="#5D7690" />
            <circle cx="102" cy="57" r="6" fill="#243D52" />
            <circle cx="119" cy="57" r="6" fill="#243D52" />
            <circle cx="102" cy="73" r="6" fill="#243D52" />
            <circle cx="120" cy="73" r="4" fill="#F8D38D" />
            <path d="M101 120c8-17 30-22 44-8" stroke="#F8F2E6" strokeWidth="5" strokeLinecap="round" />
            <path d="M105 139c12 7 23 7 34 0" stroke="#769B8D" strokeWidth="5" strokeLinecap="round" />
            <rect x="106" y="31" width="27" height="4" rx="2" fill="#DCE8EB" />
          </g>
        )}
        {variant === "vase" && (
          <g className="art-object">
            <path d="M105 35h30v30c0 12 30 26 30 58 0 27-20 42-45 42s-45-15-45-42c0-32 30-46 30-58V35Z" fill="#E7906D" />
            <path d="M105 35h30v30c0 12 30 26 30 58 0 27-20 42-45 42V35Z" fill="#CD7056" />
            <ellipse cx="120" cy="37" rx="17" ry="6" fill="#B75E4A" />
            <ellipse cx="120" cy="39" rx="12" ry="3" fill="#F5D6B2" />
            <path d="M80 119c19 10 61 10 80 0M87 143c15 7 50 7 66 0" stroke="#FFD4B4" strokeWidth="4" opacity=".8" />
            <path d="M120 37V20m0 7c-12-13-25-10-25-2 0 7 14 9 25 2Zm0 1c11-15 26-11 25-3-1 7-14 10-25 3Z" stroke="#5B8C69" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {variant === "keychain" && (
          <g className="art-object">
            <ellipse cx="101" cy="61" rx="27" ry="23" stroke="#B5BAC0" strokeWidth="10" />
            <path d="m120 77 19 14" stroke="#B5BAC0" strokeWidth="9" strokeLinecap="round" />
            <rect x="113" y="85" width="60" height="58" rx="16" transform="rotate(13 113 85)" fill="#F1BD54" />
            <path d="m132 108 7 8 16-18" stroke="#FFF7E5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="143" cy="115" r="48" stroke="#EEC45F" strokeWidth="2" opacity=".25" />
          </g>
        )}
        {variant === "toycar" && (
          <g className="art-object">
            <path d="M50 119h140l-8 27H57l-7-27Z" fill="#E7664E" />
            <path d="m72 118 19-33h48l28 33H72Z" fill="#F18968" />
            <path d="m98 91-14 25h34V91H98Zm26 0v25h34l-21-25h-13Z" fill="#C5E1E2" />
            <path d="M56 119h127v12H56z" fill="#D84E42" />
            <circle cx="82" cy="146" r="17" fill="#374443" />
            <circle cx="82" cy="146" r="7" fill="#E5D6B8" />
            <circle cx="157" cy="146" r="17" fill="#374443" />
            <circle cx="157" cy="146" r="7" fill="#E5D6B8" />
            <path d="M57 125h12m107 0h8" stroke="#FFE28A" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}
        {variant === "toolholder" && (
          <g className="art-object">
            <path d="M68 79h104l-9 82H77l-9-82Z" fill="#67927F" />
            <path d="M68 79h104l-4 19H72l-4-19Z" fill="#8DB6A0" />
            <path d="M83 80V43c0-8 13-8 13 0v37m20 0V30c0-8 13-8 13 0v50m21 0V48c0-8 13-8 13 0v32" stroke="#E7BA66" strokeWidth="9" strokeLinecap="round" />
            <path d="M87 48v19m40-30v29m28 0v14" stroke="#FFF1C7" strokeWidth="3" strokeLinecap="round" />
            <rect x="93" y="105" width="54" height="9" rx="4.5" fill="#D3E5D9" opacity=".8" />
            <ellipse cx="120" cy="162" rx="53" ry="8" fill="#426F5D" opacity=".27" />
          </g>
        )}
      </svg>
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <ProductArtwork variant={product.art} />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button
          className="quick-add"
          type="button"
          aria-label={`Add ${product.name} to bag`}
          onClick={() => onAdd(product)}
        >
          <Plus size={19} strokeWidth={2.2} />
        </button>
      </div>
      <div className="product-info">
        <div className="product-meta">
          <span>{product.category}</span>
          <span className="stock-status"><span /> Made to order</span>
        </div>
        <div className="product-title-row">
          <h3>{product.name}</h3>
          <span className="product-price">
            ${(product.priceCents / 100).toFixed(2)}
          </span>
        </div>
        <p>{product.description}</p>
        <button className="text-button" type="button" onClick={() => onAdd(product)}>
          Add to bag <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}

function readSavedBag() {
  try {
    const saved = JSON.parse(window.localStorage.getItem("novalayer-bag") ?? "[]");
    if (!Array.isArray(saved)) return [];
    const validProducts = new Set(defaultProducts.map((product) => product.id));
    const quantities = new Map();
    for (const item of saved) {
      if (
        item &&
        typeof item.id === "string" &&
        validProducts.has(item.id) &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 10
      ) {
        quantities.set(
          item.id,
          Math.min((quantities.get(item.id) ?? 0) + item.quantity, 10),
        );
      }
    }
    return [...quantities.entries()]
      .slice(0, 20)
      .map(([id, quantity]) => ({ id, quantity }));
  } catch {
    return [];
  }
}

function App() {
  const [products, setProducts] = useState(defaultProducts);
  const [catalogStatus, setCatalogStatus] = useState(supabase ? "loading" : "preview");
  const [category, setCategory] = useState("Everything");
  const [search, setSearch] = useState("");
  const [bag, setBag] = useState(readSavedBag);
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("novalayer-bag", JSON.stringify(bag));
  }, [bag]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutResult = params.get("checkout");
    if (checkoutResult === "success") {
      setOrderComplete(true);
      setBag([]);
    } else if (checkoutResult === "cancel") {
      setNotice("Checkout was cancelled. Your bag is still here if you'd like to try again.");
    }

    if (checkoutResult) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.hash}`,
      );
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    supabase
      .from("products")
      .select("id, name, category, description, price_cents, art, badge")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setCatalogStatus("error");
          setNotice(`Couldn't load the live catalog: ${error.message}`);
          return;
        }
        const supportedProducts = data?.filter((product) =>
          supportedProductIds.has(product.id),
        ) ?? [];
        if (supportedProducts.length) {
          setCatalogStatus("live");
          setProducts(
            supportedProducts.map((product) => ({
              ...product,
              priceCents: product.price_cents,
            })),
          );
        } else {
          setCatalogStatus(data?.length ? "schema" : "preview");
          setNotice(
            data?.length
              ? "The Supabase catalog needs updating. Run supabase/schema.sql to load the six products and prices."
              : "No active products found in Supabase. Run supabase/schema.sql to seed the catalog. Showing the sample catalog.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && !saving) {
        setBagOpen(false);
        setCheckoutOpen(false);
        setOrderComplete(false);
        setMobileMenuOpen(false);
        setNotice("");
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [saving]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "Everything" || product.category === category;
      const matchesSearch =
        !query ||
        `${product.name} ${product.description} ${product.category}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, products, search]);

  const bagProducts = bag.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.id);
    return product ? [{ ...product, quantity: item.quantity }] : [];
  });
  const bagCount = bagProducts.reduce((total, item) => total + item.quantity, 0);
  const subtotalCents = bagProducts.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  );

  function addToBag(product) {
    const existing = bag.find((item) => item.id === product.id);
    if (existing?.quantity >= 10) {
      setNotice(`${product.name} is limited to 10 per order.`);
      return;
    }
    if (!existing && bag.length >= 20) {
      setNotice("Your bag is full. Checkout or remove an item to continue.");
      return;
    }
    setBag((items) => {
      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...items, { id: product.id, quantity: 1 }];
    });
    setNotice(`${product.name} added to your bag.`);
  }

  function updateQuantity(productId, delta) {
    setBag((items) =>
      items
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function browseProducts() {
    setCategory("Everything");
    setSearch("");
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  }

  async function submitOrder(event) {
    event.preventDefault();
    if (!customerName.trim() || !contact.trim() || bagProducts.length === 0) {
      setNotice("Add your name and a way to reach you before sending.");
      return;
    }
    if (!supabase) {
      setNotice(
        "Connect Supabase to take payments. Add the project URL and anon key to .env.local.",
      );
      return;
    }

    setSaving(true);
    setNotice("");
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            customer_name: customerName.trim(),
            contact: contact.trim(),
            note: note.trim(),
            items: bagProducts.map(({ id, quantity }) => ({
              product_id: id,
              quantity,
            })),
          },
        },
      );
      if (error) {
        let message = error.message;
        if (error.context && typeof error.context.json === "function") {
          try {
            const details = await error.context.json();
            if (typeof details?.error === "string") message = details.error;
          } catch {
            message = error.message;
          }
        }
        setNotice(`Couldn't start checkout: ${message}`);
        return;
      }

      const checkoutUrl = new URL(data?.url);
      if (
        checkoutUrl.protocol !== "https:" ||
        checkoutUrl.hostname !== "checkout.stripe.com"
      ) {
        setNotice("Checkout returned an invalid payment link. Please try again.");
        return;
      }
      setCheckoutOpen(false);
      window.location.assign(checkoutUrl.href);
    } catch (error) {
      setNotice(
        `Couldn't start checkout: ${
          error instanceof Error ? error.message : "Please try again."
        }`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="site-shell">
      <div className="announcement">
        <Sparkles size={14} />
        <span>Little 3D-printed things, starting at $3.</span>
        <a href="#shop">Find a favorite <ArrowRight size={13} /></a>
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Novalayer home">
          <span className="brand-icon"><Cuboid size={22} strokeWidth={2} /></span>
          <span>nova<span>layer</span></span>
        </a>
        <nav className={`main-nav ${mobileMenuOpen ? "is-open" : ""}`}>
          <a href="#shop" onClick={() => setMobileMenuOpen(false)}>Shop all</a>
          <a href="#shop" onClick={() => { setCategory("Collectibles"); setMobileMenuOpen(false); }}>Collectibles</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>Our little workshop</a>
          <a href="#custom" onClick={() => setMobileMenuOpen(false)}>Personalized gifts</a>
        </nav>
        <div className="header-actions">
          <button
            className="bag-button"
            type="button"
            onClick={() => setBagOpen(true)}
            aria-label={`Open bag, ${bagCount} items`}
          >
            <ShoppingBag size={18} />
            <span>Bag</span>
            <span className="bag-count">{bagCount}</span>
          </button>
          <button
            className="menu-toggle"
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-kicker"><span /> Made to make you smile</div>
            <h1>Little things.<br /><span>Big happy.</span></h1>
            <p className="hero-description">
              Little figures, playful accessories, and useful prints for your
              space. Made with care, one layer at a time.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#shop">Find your thing <ArrowRight size={17} /></a>
              <a className="button button-light" href="#about">How it works <ArrowDown size={16} /></a>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span>✳</span><span>☺</span><span>✦</span>
              </div>
              <p><strong>Made for curious people</strong><br />Small-batch prints, big-time fun.</p>
            </div>
          </div>
          <div className="hero-artboard">
            <div className="hero-sun" />
            <div className="hero-note note-top"><Sparkles size={15} /> Made one layer at a time</div>
            <ProductArtwork variant="vase" className="hero-cube" />
            <ProductArtwork variant="miniature" className="hero-hex" />
            <ProductArtwork variant="keychain" className="hero-ring" />
            <div className="hero-sticker"><span>GOOD<br />VIBES<br />ONLY</span><span>✳</span></div>
            <div className="hero-note note-bottom"><span className="note-dot" /> Tiny prints, ready for big adventures</div>
            <div className="hero-scribble" aria-hidden="true">✳</div>
          </div>
        </section>

        <section className="value-strip" aria-label="Shop benefits">
          <div><span className="value-icon"><PackageCheck size={18} /></span><span><strong>Printed with care</strong><small>Small batches, extra love</small></span></div>
          <div><span className="value-icon"><Sparkles size={18} /></span><span><strong>Playfully practical</strong><small>Useful things, made fun</small></span></div>
          <div><span className="value-icon"><Check size={18} /></span><span><strong>Secure checkout</strong><small>Pay safely with Stripe</small></span></div>
        </section>

        <section className="shop-section section-wrap" id="shop">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">The little shop</p>
              <h2>Good things, <span>made layer by layer.</span></h2>
              <p className="section-intro">Find a favorite, add it to your bag, and check out securely with Stripe.</p>
            </div>
            <div className="catalog-note"><span className="note-dot" /> {catalogStatus === "loading" ? "Loading the workshop catalog" : catalogStatus === "live" ? "Live from our little workshop" : catalogStatus === "error" ? "Sample catalog · connection issue" : catalogStatus === "schema" ? "Sample catalog · update Supabase schema" : "A little preview of the shop"}</div>
          </div>
          <div className="shop-tools">
            <div className="category-list" role="group" aria-label="Filter products by category">
              {categories.map((item) => (
                <button
                  className={category === item ? "category-chip active" : "category-chip"}
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="search-field">
              <Search size={17} />
              <input
                type="search"
                placeholder="Looking for something?"
                aria-label="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <ChevronDown size={14} className="search-chevron" />
            </label>
          </div>
          {notice && !bagOpen && !checkoutOpen && (
            <div className="inline-notice" role="status">
              <span>{notice}</span>
              <button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}><X size={16} /></button>
            </div>
          )}
          {visibleProducts.length ? (
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToBag} />
              ))}
            </div>
          ) : (
            <div className="empty-search">
              <span>✳</span>
              <h3>No tiny treasures found</h3>
              <p>Try a different search or pick another category.</p>
              <button className="text-button" type="button" onClick={() => { setSearch(""); setCategory("Everything"); }}>Show me everything <ArrowRight size={15} /></button>
            </div>
          )}
          <div className="browse-bottom">
            <span>More fun is always in the works.</span>
            <button type="button" className="text-button" onClick={browseProducts}>Find a personalized gift <ArrowUpRight size={16} /></button>
          </div>
        </section>

        <section className="custom-banner" id="custom">
          <div className="custom-art">
            <div className="custom-orbit orbit-one" />
            <div className="custom-orbit orbit-two" />
            <ProductArtwork variant="phonecase" />
            <span className="custom-sparkle sparkle-one">✳</span>
            <span className="custom-sparkle sparkle-two">✦</span>
          </div>
          <div className="custom-copy">
            <p className="section-eyebrow">A little different?</p>
            <h2>Got an idea?<br /><span>Let’s make it real.</span></h2>
            <p>Looking for something with your own touch? Choose a phone case or keychain, then leave your design details in the checkout note.</p>
            <button className="button button-dark" type="button" onClick={browseProducts}>Find something to personalize <ArrowRight size={17} /></button>
          </div>
          <span className="custom-tag">YOUR IDEA, OUR PRINTER ✳</span>
        </section>

        <section className="about-section section-wrap" id="about">
          <div className="about-title">
            <p className="section-eyebrow">A tiny bit about us</p>
            <h2>Big ideas don’t<br />need a big machine.</h2>
          </div>
          <div className="about-copy">
            <p>We think 3D printing should be for everyone. So we make small, joyful, genuinely useful things without the big price tag or the big learning curve.</p>
            <div className="about-points">
              <div><span>01</span><strong>Pick a little something</strong><small>Miniature, accessory, toy, or desk helper.</small></div>
              <div><span>02</span><strong>We print it with care</strong><small>Made to order, with thoughtful details.</small></div>
              <div><span>03</span><strong>It’s on its way to you</strong><small>Free U.S. shipping is included.</small></div>
            </div>
          </div>
        </section>

        <section className="closing-cta">
          <span className="closing-star">✳</span>
          <p>Good things come in small prints.</p>
          <a href="#shop">Find your new favorite <ArrowRight size={16} /></a>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top"><span className="brand-icon"><Cuboid size={20} /></span><span>nova<span>layer</span></span></a>
        <p>Made with curiosity, one layer at a time.</p>
        <span className="footer-note">© {new Date().getFullYear()} Novalayer · Secure Stripe checkout · No account needed</span>
      </footer>

      {bagOpen && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) { setBagOpen(false); setNotice(""); } }}>
          <aside className="bag-panel" role="dialog" aria-modal="true" aria-labelledby="bag-title">
            <div className="panel-header">
              <div><p className="section-eyebrow">The good stuff</p><h2 id="bag-title">Your bag <span>({bagCount})</span></h2></div>
              <button className="icon-button" type="button" aria-label="Close bag" onClick={() => { setBagOpen(false); setNotice(""); }}><X size={21} /></button>
            </div>
            {notice && <div className="panel-notice" role="status">{notice}</div>}
            {bag.length === 0 ? (
              <div className="bag-empty"><span><ShoppingBag size={26} /></span><h3>Your bag is taking a nap.</h3><p>It’s ready for something fun.</p><button className="button button-dark" type="button" onClick={() => setBagOpen(false)}>Find a favorite <ArrowRight size={16} /></button></div>
            ) : (
              <>
                <div className="bag-items">
                  {bagProducts.map((item) => (
                    <div className="bag-item" key={item.id}>
                      <ProductArtwork variant={item.art} />
                      <div className="bag-item-info"><strong>{item.name}</strong><span>${(item.priceCents / 100).toFixed(2)} each</span><div className="quantity-control"><button type="button" aria-label={`Remove one ${item.name}`} onClick={() => updateQuantity(item.id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" aria-label={`Add one ${item.name}`} disabled={item.quantity >= 10} onClick={() => updateQuantity(item.id, 1)}><Plus size={13} /></button></div></div>
                      <strong className="bag-item-total">${((item.priceCents * item.quantity) / 100).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
                <div className="bag-summary"><div><span>Subtotal</span><strong>${(subtotalCents / 100).toFixed(2)}</strong></div><p>Free U.S. shipping. Pay securely on Stripe Checkout.</p><button className="button button-dark checkout-button" type="button" onClick={() => { setBagOpen(false); setNotice(""); setCheckoutOpen(true); }}>Continue to checkout <ArrowRight size={17} /></button></div>
              </>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) { setCheckoutOpen(false); setNotice(""); } }}>
          <section className="checkout-panel" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
            <div className="panel-header">
              <div><p className="section-eyebrow">Secure Stripe checkout</p><h2 id="checkout-title">Almost yours.</h2></div>
              <button className="icon-button" type="button" aria-label="Close order form" disabled={saving} onClick={() => { setCheckoutOpen(false); setNotice(""); }}><X size={21} /></button>
            </div>
            <p className="checkout-intro">Add your name and contact details, then Stripe will securely collect payment and your U.S. shipping address. Shipping is free; no account is needed.</p>
            <form className="checkout-form" onSubmit={submitOrder}>
              <label>Your name<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} maxLength={100} required autoComplete="name" placeholder="What should we call you?" /></label>
              <label>Contact details<input value={contact} onChange={(event) => setContact(event.target.value)} maxLength={200} required placeholder="Email, phone, or social handle" /></label>
              <label>Anything we should know? <span className="optional-label">Optional</span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1500} rows={3} placeholder="Color, custom details, questions..." /></label>
              <div className="checkout-recap"><span>{bagCount} {bagCount === 1 ? "item" : "items"} · free U.S. shipping</span><strong>${(subtotalCents / 100).toFixed(2)}</strong></div>
              {notice && <p className="form-notice" role="alert">{notice}</p>}
              <button className="button button-dark checkout-button" type="submit" disabled={saving}>{saving ? "Opening secure checkout..." : "Continue to secure payment"} {!saving && <ArrowRight size={17} />}</button>
              <p className="privacy-note">Stripe handles your payment details securely. No account is needed.</p>
            </form>
          </section>
        </div>
      )}

      {orderComplete && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOrderComplete(false); }}>
          <section className="success-panel" role="dialog" aria-modal="true" aria-labelledby="success-title">
            <span className="success-icon"><Check size={27} /></span>
            <p className="section-eyebrow">Thanks for shopping small</p>
            <h2 id="success-title">You’re all checked out.</h2>
            <p>Stripe has returned you from checkout. We’re confirming the payment and order details now; the order will be marked paid only after Stripe confirms it.</p>
            <button className="button button-dark" type="button" onClick={() => setOrderComplete(false)}>Back to the good stuff <ArrowRight size={16} /></button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
