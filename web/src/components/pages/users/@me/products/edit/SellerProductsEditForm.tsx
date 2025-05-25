import "@styles/pages/users/@me/products/edit_form.scss";

import type { Product, ProductFullTextSearch } from "@interfaces/Product";
import type { Schedule } from "@interfaces/Schedule";
import { useContext, useEffect, useRef, useState } from "react";
import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import type { ProductImage } from "./SellerProductsEditContext";
import SellerProductsEditContext from "./SellerProductsEditContext";
import ScheduleSelectionModal from "@components/pages/users/products/body/ScheduleModal.tsx";
import {dayNumberToName} from "@utils/weekDays.ts";

function ProductImages() {
    const context = useContext(SellerProductsEditContext)

    const inputRef = useRef<HTMLInputElement>()
    const buttonRef = useRef<HTMLButtonElement>()

    const [hrefs, setHrefs] = useState(() => context.currentImages.current)

    useEffect(() => {
        buttonRef.current.addEventListener("click", () => {
            if(hrefs.length >= 5) {
                return alert("O limite de imagens é 5.")
            }
            inputRef.current.click()
        })

        inputRef.current.addEventListener("change", () => {
            const files = inputRef.current.files

            for(const file of files) {
                const reader = new FileReader()

                const handler = () => {
                    setHrefs((v => [ ...v, { src: reader.result as string }]))
                    context.currentImages.current.push({ src: reader.result as string })
                    reader.removeEventListener("load", handler)
                }

                reader.addEventListener("load", handler)
                reader.readAsDataURL(file)
            }
        })
    }, [])

    return (
        <>
            <input type="file" accept="image/jpeg, image/jpg, image/png" multiple style={{ display: "none" }} ref={inputRef} />

            <button className="image add_image" type="button" ref={buttonRef}>
                <div className="add_content">
                    <img
                        src="/assets/plus.svg"
                        width={32}
                        height={32}
                        alt="Adicionar foto"
                    />
                    <span>Adicionar</span>
                </div>
            </button>
            {
                hrefs.map((href, index) => {
                    return (
                        <div className="image" key={href.src}>
                            <button type="button" className="photo_button" onClick={() => {
                                setHrefs(currentHrefs => currentHrefs.filter(h => h.src !== href.src))
                                context.currentImages.current = context.currentImages.current.filter(h => h.src !== href.src)
                                if(href.id) {
                                    context.toRemoveImages.current.push(href.id)
                                }
                            }}>
                                <img
                                    src={href.src}
                                    width={128}
                                    height={128}
                                    alt={`Foto do produto ${index + 1}`}
                                    className="photo product_image_preview"
                                />
                                <div className="remove_overlay">
                                    <img
                                        src="/assets/X-white.svg"
                                        width={24}
                                        height={24}
                                        alt="Remover foto"
                                        className="close"
                                    />
                                </div>
                            </button>
                        </div>
                    )
                })
            }
        </>
    )
}

export default function SellerProductsEditForm(props: { seller_id: number, product?: Product, categories: ProductFullTextSearch[] }) {
    const editMode = !(props.product === undefined || props.product === null)

    const imagesHref = useRef<ProductImage[]>(props.product?.photos.map(p => {
        return {
            src: `${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/products/${props.product.id}/${p.replace("/", "⁄")}.jpg?size=256`,
            id: p
        }
    }) || [])

    const toRemoveImages = useRef<string[]>([])
    const formRef = useRef<HTMLFormElement>()
    const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([])
    const [showScheduleModal, setShowScheduleModal] = useState(false)

    const wrapper = new APIWrapper(RequestAPIFrom.Client)

    async function submit() {
        const form = new FormData(formRef.current)
        const images = document.querySelectorAll<HTMLImageElement>(".product_image_preview")

        for(const schedule of selectedSchedules) {
            form.append("schedules_id", String(schedule.id))
        }

        for(const image of images) {
            const request = await fetch(image.src)
            const blob = await request.blob()

            if(editMode) {
                form.append("add_photos", blob)
            } else {
                form.append("photos", blob)
            }
        }

        if(editMode) {
            for(const photoID of toRemoveImages.current) {
                form.append("remove_photos", photoID)
            }
        }

        try {
            if(editMode) {
                await wrapper.editProduct(props.seller_id, props.product.id, form)
            } else {
                await wrapper.createProduct(props.seller_id, form)
            }
            window.location.href = "/users/@me/products"
        } catch (error) {
            alert("Erro ao salvar produto. Tente novamente.")
            console.error(error)
        }
    }

    const handleScheduleAdd = (schedule: Schedule) => {
        if (!selectedSchedules.find(s => s.id === schedule.id)) {
            setSelectedSchedules([...selectedSchedules, schedule])
        }
        setShowScheduleModal(false)
    }

    const removeSchedule = (scheduleId: number) => {
        setSelectedSchedules(selectedSchedules.filter(s => s.id !== scheduleId))
    }

    return (
        <SellerProductsEditContext.Provider value={{ currentImages: imagesHref, toRemoveImages: toRemoveImages, editMode: editMode }}>
            <div className="product_edit_container">
                <form className="product_edit_form" ref={formRef} onSubmit={(e) => {
                    e.preventDefault()
                    submit()
                }}>
                    <div className="form_section">
                        <h2>Imagens do Produto</h2>
                        <p className="section_description">Adicione até 5 fotos do seu produto</p>
                        <section className="product_images">
                            <ProductImages />
                        </section>
                    </div>

                    <div className="form_section">
                        <h2>Informações do Produto</h2>
                        <div className="input_group">
                            <label>Categoria do Produto</label>
                            <select className="product_type" name="product_id" defaultValue={props.product?.product?.id || ""} required>
                                <option value="">Selecione uma categoria</option>
                                {props.categories.map((category, i) => (
                                    <option key={`category-${category.category_id}-${i}`} value={category.product_id}>
                                        {category.product_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="product_infos">
                            <div className="input_group">
                                <label>Valor (R$)</label>
                                <input
                                    type="number"
                                    name="price"
                                    step="0.01"
                                    min="0"
                                    placeholder="0,00"
                                    defaultValue={String(props.product?.price)?.replace(/,/g, ".") || ""}
                                />
                            </div>
                            <div className="input_group">
                                <label>Em Estoque</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="0"
                                    placeholder="0"
                                    defaultValue={props.product?.quantity || ""}
                                />
                            </div>
                            <div className="input_group">
                                <label>Quantidade por Unidade</label>
                                <input
                                    type="number"
                                    name="unit_quantity"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    defaultValue={props.product?.unit_quantity || ""}
                                />
                            </div>
                            <div className="input_group">
                                <label>Unidade de Medida</label>
                                <select name="unit" defaultValue={props.product?.unit || 0}>
                                    <option value={0}>Quilograma (kg)</option>
                                    <option value={1}>Hectograma (hg)</option>
                                    <option value={2}>Decagrama (dag)</option>
                                    <option value={3}>Grama (g)</option>
                                    <option value={4}>Centigrama (cg)</option>
                                    <option value={5}>Miligrama (mg)</option>
                                    <option value={6}>Unidade (u)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form_section">
                        <h2>Dias de Venda</h2>
                        <p className="section_description">Selecione os dias em que este produto estará disponível</p>

                        <button
                            type="button"
                            className="add_schedule_btn"
                            onClick={() => setShowScheduleModal(true)}
                        >
                            <img src="/assets/plus.svg" width={20} height={20} alt="Adicionar" />
                            Adicionar Dia de Venda
                        </button>

                        {selectedSchedules.length > 0 && (
                            <div className="selected_schedules">
                                {selectedSchedules.map((schedule) => (
                                    <div key={schedule.id} className="schedule_chip">
                                        <span>{dayNumberToName[schedule.day_of_week]} - {schedule.start_time} às {schedule.end_time} na(o) {schedule.address}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSchedule(schedule.id)}
                                            className="remove_schedule"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form_section">
                        <h2>Descrição</h2>
                        <div className="input_group">
                            <textarea
                                name="description"
                                placeholder="Descreva seu produto, suas características e benefícios..."
                                defaultValue={props.product?.description || ""}
                            />
                        </div>
                    </div>

                    <button type="submit" className="save_btn">
                        Salvar
                    </button>
                </form>

                {showScheduleModal && (
                    <ScheduleSelectionModal
                        productId={props.product?.id}
                        sellerId={props.seller_id}
                        selected={null}
                        onClose={() => setShowScheduleModal(false)}
                        onScheduleSelected={handleScheduleAdd}
                    />
                )}
            </div>
        </SellerProductsEditContext.Provider>
    )
}